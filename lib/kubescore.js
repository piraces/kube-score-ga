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
const MacOS = 'darwin';
const Windows = 'win32';
const Linux = 'linux';
const ARM = 'arm';
const ARM64 = 'arm64';
const x64 = 'x64';
const WindowsBinPath = 'D:\\a\\bin\\';
const UnixBinPath = '/home/runner/bin/';
const binPath = os.platform() === 'win32' ? WindowsBinPath : UnixBinPath;
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
        core.info(`Moving tool from ${downloadPath} to ${path.join(binPath, 'kube-score')}`);
        yield io.mv(downloadPath, path.join(binPath, 'kube-score'));
        core.info('Adding kube-score to the cache ...');
        const actualVersion = version || (yield getLatestVersionTag());
        const toolPath = yield tc.cacheDir(binPath, 'kube-score', actualVersion);
        core.info('Done');
        core.addPath(toolPath);
        if (os.platform() !== 'win32') {
            yield exec.exec('chmod', ['+x', toolPath]);
        }
    });
}
exports.downloadKubeScore = downloadKubeScore;
function runKubeScore() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec.exec(binPath + 'kube-score', ['version']);
    });
}
exports.runKubeScore = runKubeScore;
function getReleaseUrl(version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!version) {
            version = yield getLatestVersionTag();
        }
        const architecture = getArchitecture();
        const osInfo = getOperatingSystemInfo();
        if (!architecture || !osInfo) {
            return '';
        }
        const platform = osInfo[0];
        const suffix = osInfo[1];
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
function getOperatingSystemInfo() {
    const osPlatform = os.platform();
    switch (osPlatform) {
        case MacOS:
            return ['darwin', ''];
        case Windows:
            return ['windows', '.exe'];
        case Linux:
            return ['linux', ''];
        default:
            core.setFailed('[FATAL] Unsupported OS... Supported: MacOS, Windows, Linux.');
            return ['', ''];
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
