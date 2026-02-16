
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getCpuUsage() {
    const cpus = os.cpus();
    return cpus.map((cpu) => {
        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        const usage = 100 - (100 * cpu.times.idle) / total;
        return usage.toFixed(1);
    });
}

async function getCpuTemp() {
    try {
        const { stdout } = await execAsync("vcgencmd measure_temp");
        // in celsius! OBVIOUSLY!
        return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
    } catch (err) {
        console.error("Error getting CPU temp:", err);
        return 0;  // Return 0 if we can't get the temp
    }
}

function bytesToGB(bytes: number) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(", ") : "< 1 min";
}

async function getDiskUsage(): Promise<{ used: number; total: number; percent: number }> {
    try {
        const { stdout } = await execAsync("df -B1 / | tail -1");
        const parts = stdout.trim().split(/\s+/);
        const total = parseInt(parts[1], 10);
        const used = parseInt(parts[2], 10);
        return {
            total: parseFloat(bytesToGB(total)),
            used: parseFloat(bytesToGB(used)),
            percent: Math.round((used / total) * 100),
        };
    } catch {
        return { used: 0, total: 0, percent: 0 };
    }
}

async function getLocalIp(): Promise<string> {
    try {
        const { stdout } = await execAsync(
            "hostname -I | awk '{print $1}'"
        );
        return stdout.trim() || "N/A";
    } catch {
        return "N/A";
    }
}

export async function getSystemDetails() {
    try {
        const cpuUsage = getCpuUsage();

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const freeMemPercent = (freeMem / totalMem) * 100;

        const [cpuTemp, diskUsage, localIp] = await Promise.all([
            getCpuTemp(),
            getDiskUsage(),
            getLocalIp(),
        ]);

        const loadAvg = os.loadavg();

        return {
            os,
            cpuTemp,
            cpuUsage,
            memoryUsage: {
                total: parseFloat(bytesToGB(totalMem)),
                used: parseFloat(bytesToGB(usedMem)),
                free: parseFloat(bytesToGB(freeMem)),
                freePercent: parseFloat(freeMemPercent.toFixed(1)),
            },
            uptime: formatUptime(os.uptime()),
            loadAverage: {
                one: loadAvg[0].toFixed(2),
                five: loadAvg[1].toFixed(2),
                fifteen: loadAvg[2].toFixed(2),
            },
            diskUsage,
            localIp,
            timestamp: new Date().toLocaleString(),
        };
    } catch (err) {
        console.error("Error getting system details:", err);
        throw err;
    }
}