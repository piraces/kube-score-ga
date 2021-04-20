import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as axios from 'axios';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import * as glob from 'glob';

const MacOS = 'darwin';
const Windows = 'win32';
const Linux = 'linux';

const ARM = 'arm';
const ARM64 = 'arm64';
const x64 = 'x64';

const WindowsBinPath = 'D:\\a\\bin\\';
const LinuxBinPath = '/home/runner/bin/';
const DarwinBinPath = '/Users/runner/bin';

const binPath = getBinPathByOperatingSystem();

const ignoreExitCode = core.getInput('ignore-exit-code').toLowerCase() === 'true';

export async function downloadKubeScore(version: string | undefined = undefined): Promise<void> {
    core.info('Getting kube-score binary...');
    const actualVersion = version || (await getLatestVersionTag());
    const actualArchitecture = getArchitecture();

    const cachedToolDir = tc.find('kube-score', actualVersion, actualArchitecture);
    if (cachedToolDir) {
        core.info('kube-score found in cache! No need to download it...');
        core.addPath(cachedToolDir);
        return;
    }

    core.info('Downloading kube-score...');
    const url = await getReleaseUrl(version);
    if (!url) {
        core.setFailed('[FATAL] Unable to extract release URL.');
    }
    const downloadPath = await tc.downloadTool(url);
    core.info('Downloaded!');

    await io.mkdirP(binPath);
    const toolDir = path.join(binPath, 'kube-score' + getSuffix());
    core.info(`Moving tool from ${downloadPath} to ${toolDir}`);
    await io.mv(downloadPath, toolDir);
    core.addPath(binPath);

    core.info('Adding kube-score to the cache...');
    await tc.cacheDir(binPath, 'kube-score', actualVersion, actualArchitecture);
    core.info('Done');

    if (os.platform() !== 'win32') {
        await exec.exec('chmod', ['+x', toolDir]);
    }
}

export async function runKubeScore(dirs: Array<string>, outputFile: string): Promise<void> {
    let stream: fs.WriteStream | undefined;
    if (outputFile && outputFile.length > 0) {
        stream = fs.createWriteStream(outputFile);
    }

    for (const dir of dirs) {
        const actualDir = path.join(process.cwd(), dir);
        const files = glob.sync(actualDir, {});
        await processFilesWithKubeScore(files, stream);
    }

    if (stream) {
        stream.end();
    }
}

export async function getReleaseUrl(version: string | undefined): Promise<string> {
    if (!version) {
        version = await getLatestVersionTag();
    }
    const architecture = getArchitecture();
    const platform = getOperatingSystem();

    if (!architecture || !platform) {
        return '';
    }

    core.info(`Running on OS '${platform}', architecture '${architecture}'`);

    const releaseUrl = `https://github.com/zegl/kube-score/releases/download/v${version}/kube-score_${version}_${platform}_${architecture}${getSuffix()}`;
    core.info(`Release URL: ${releaseUrl}`);
    return releaseUrl;
}

function getArchitecture(): string {
    const architecture = os.arch();
    const allowedArchitectures = [ARM, ARM64, x64];

    if (!allowedArchitectures.includes(architecture)) {
        core.setFailed('[FATAL] Unsupported architecture... Supported: ARMv6, ARM64, x64.');
        return '';
    }

    switch (architecture) {
        case ARM:
            return 'armv6';
        case ARM64:
            return 'arm64';
        default:
            return 'amd64';
    }
}

function getOperatingSystem(): string {
    const osPlatform = os.platform();

    switch (osPlatform) {
        case MacOS:
            return 'darwin';
        case Windows:
            return 'windows';
        case Linux:
            return 'linux';
        default:
            core.setFailed('[FATAL] Unsupported OS... Supported: MacOS, Windows, Linux.');
            return '';
    }
}

function getSuffix(): string {
    return os.platform() === 'win32' ? '.exe' : '';
}

function getBinPathByOperatingSystem(): string {
    switch (os.platform()) {
        case MacOS:
            return DarwinBinPath;
        case Windows:
            return WindowsBinPath;
        case Linux:
            return LinuxBinPath;
        default:
            core.setFailed('[FATAL] Unsupported OS... Supported: MacOS, Windows, Linux.');
            return '';
    }
}

async function getLatestVersionTag(): Promise<string> {
    return await axios.default
        .get('https://api.github.com/repos/zegl/kube-score/releases/latest')
        .then(function (response: { data: { tag_name: string } }) {
            return response.data.tag_name.replace('v', '');
        })
        .catch(function (error: { message: string }) {
            core.setFailed('[FATAL] Error while retrieving latest version tag: ' + error.message);
            return '';
        });
}

async function processFilesWithKubeScore(files: string[], stream: fs.WriteStream | undefined) {
    for (const file of files) {
        core.info(`[KUBE-SCORE] Scanning file '${file}'...`);
        try {
            let exitCode: number;
            if (stream) {
                stream.write(`*** Analysis for file '${file}' ***\n\n`);
                exitCode = await exec.exec('kube-score', ['score', file], { outStream: stream, errStream: stream });
                stream.write(`\n\n*** End analysis for file '${file}' ***\n\n`);
            } else {
                exitCode = await exec.exec('kube-score', ['score', file]);
            }

            if (exitCode !== 0) {
                core.info(`[KUBE-SCORE] Scan for file '${file}' succeeded!`);
            }
        } catch {
            if (ignoreExitCode) {
                core.error('[FAILED][KUBE-SCORE] Scan failed...');
            } else {
                core.setFailed('[KUBE-SCORE] Scan failed...');
            }
        }

        core.info(`[KUBE-SCORE] Scanned file '${file}'`);
    }
}
