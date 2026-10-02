import os from 'node:os';

export function getSystemInfo() {
  const cpus = os.cpus();

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || 'Unknown',
    loadAverage: os.loadavg(),
    userInfo: os.userInfo(),
    isWindows: os.platform() === 'win32',
    isLinux: os.platform() === 'linux',
    isMac: os.platform() === 'darwin',
  };
}
