"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleaseUrl = exports.runKubeScore = exports.downloadKubeScore = void 0;
const os = require('os');
const path = require('path');
const axios = require('axios');
const core = require('@actions/core');
const io = require('@actions/io');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const glob = require("glob");
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
const suffix = os.platform() === 'win32' ? '.exe' : '';
function downloadKubeScore(version = undefined) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info('Downloading kube-score...');
        const url = yield getReleaseUrl(version);
        if (!url) {
            core.setFailed('[FATAL] Unable to extract release URL.');
        }
        const downloadPath = yield tc.downloadTool(url);
        core.info('Downloaded!');
        yield io.mkdirP(binPath);
        const toolDir = path.join(binPath, 'kube-score' + suffix);
        core.info(`Moving tool from ${downloadPath} to ${toolDir}`);
        yield io.mv(downloadPath, toolDir);
        core.addPath(binPath);
        core.info('Adding kube-score to the cache...');
        const actualVersion = version || (yield getLatestVersionTag());
        yield tc.cacheDir(binPath, 'kube-score', actualVersion);
        core.info('Done');
        if (os.platform() !== 'win32') {
            yield exec.exec('chmod', ['+x', toolDir]);
        }
    });
}
exports.downloadKubeScore = downloadKubeScore;
function runKubeScore(dirs) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const dir of dirs) {
            const actualDir = path.join(process.cwd(), dir);
            glob(actualDir, function (err, files) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        core.setFailed(err);
                    }
                    else {
                        yield processFilesWithKubeScore(files);
                    }
                });
            });
        }
    });
}
exports.runKubeScore = runKubeScore;
function getReleaseUrl(version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!version) {
            version = yield getLatestVersionTag();
        }
        const architecture = getArchitecture();
        const platform = getOperatingSystem();
        if (!architecture || !platform) {
            return '';
        }
        core.info(`Running on OS '${platform}', architecture '${architecture}'`);
        const releaseUrl = `https://github.com/zegl/kube-score/releases/download/v${version}/kube-score_${version}_${platform}_${architecture}${suffix}`;
        core.info(`Release URL: ${releaseUrl}`);
        return releaseUrl;
    });
}
exports.getReleaseUrl = getReleaseUrl;
function getArchitecture() {
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
function getOperatingSystem() {
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
function getBinPathByOperatingSystem() {
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
function getLatestVersionTag() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield axios.get('https://api.github.com/repos/zegl/kube-score/releases/latest').then(function (response) {
            return response.data.tag_name.replace('v', '');
        }).catch(function (error) {
            core.setFailed('[FATAL] Error while retrieving latest version tag: ' + error.message);
            return '';
        });
    });
}
function processFilesWithKubeScore(files) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const file of files) {
            core.info(`[KUBE-SCORE] Scanning file '${file}'...`);
            const exitCode = yield exec.exec('kube-score', ['score', file]);
            if (exitCode !== 0) {
                core.info(`[KUBE-SCORE] Scan for file '${file}' succeeded!`);
            }
        }
    });
}
