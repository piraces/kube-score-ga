System.register([], function (exports_1, context_1) {
    "use strict";
    var os, path, request, core, io, exec, tc, MacOS, Windows, Linux, ARM, ARM64, x64;
    var __moduleName = context_1 && context_1.id;
    async function downloadKubeScore(version = undefined) {
        core.info('Downloading kube-score...');
        const url = getReleaseUrl(version);
        const downloadPath = await tc.downloadTool(url);
        await io.mv(downloadPath, path.join(downloadPath, 'kube-score'));
        core.info('Adding kube-score to the cache ...');
        const toolPath = await tc.cacheDir(downloadPath, 'node', version || getLatestVersionTag());
        core.info('Done');
        core.addPath(toolPath);
        if (os.platform() !== 'win32') {
            await exec.exec('chmod', ['+x', toolPath]);
        }
    }
    exports_1("downloadKubeScore", downloadKubeScore);
    async function runKubeScore() {
        await exec.exec('kube-score', ['version']);
    }
    exports_1("runKubeScore", runKubeScore);
    async function getReleaseUrl(version) {
        if (!!version) {
            version = await getLatestVersionTag();
        }
        const architecture = getArchitecture();
        const osInfo = getOperatingSystemInfo();
        if (!architecture || !osInfo) {
            return '';
        }
        const platform = osInfo[0];
        const suffix = osInfo[1];
        return `https://github.com/zegl/kube-score/releases/download/v${version}/kube-score_${platform}_${architecture}${suffix}`;
    }
    exports_1("getReleaseUrl", getReleaseUrl);
    function getArchitecture() {
        const architecture = os.arch();
        const allowedArchitectures = [ARM, ARM64, x64];
        if (!allowedArchitectures.includes(architecture)) {
            core.error("[FATAL] Unsupported architecture... Supported: ARMv6, ARM64, x64.");
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
                core.error("[FATAL] Unsupported OS... Supported: MacOS, Windows, Linux.");
                return ['', ''];
        }
    }
    async function getLatestVersionTag() {
        return await request('https://api.github.com/repos/zegl/kube-score/releases/latest', { json: true }, (err, res, body) => {
            if (err) {
                core.error("[FATAL] Error while retrieving latest version tag: " + err.message);
                return;
            }
            return body.tag_name.replace('v', '');
        });
    }
    return {
        setters: [],
        execute: function () {
            os = require('os');
            path = require('path');
            request = require('request');
            core = require('@actions/core');
            io = require('@actions/io');
            exec = require('@actions/exec');
            tc = require('@actions/tool-cache');
            MacOS = 'darwin';
            Windows = 'win32';
            Linux = 'linux';
            ARM = 'arm';
            ARM64 = 'arm64';
            x64 = 'x64';
        }
    };
});
