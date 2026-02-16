import { getSystemDetails } from "@/lib/system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function Home() {
  const s = await getSystemDetails();
  const memUsedPercent = (s.memoryUsage.used / s.memoryUsage.total) * 100;

  return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">PI5 status!</h1>
            <span className="text-xs text-muted-foreground">
              Last refreshed: {s.timestamp}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">System Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  ["Hostname", s.os.hostname()],
                  ["Platform", s.os.platform()],
                  ["Architecture", s.os.arch()],
                  ["Local IP", s.localIp],
                  ["Uptime", s.uptime],
                ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-medium">{value}</span>
                    </div>
                ))}
              </CardContent>
            </Card>

            {/* CPU Temperature & Load */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">CPU Temperature & Load</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="text-foreground font-medium">{s.cpuTemp.toFixed(1)}°C</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Load Average</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["1m", s.loadAverage.one],
                      ["5m", s.loadAverage.five],
                      ["15m", s.loadAverage.fifteen],
                    ].map(([label, value]) => (
                        <div key={label} className="bg-muted rounded-md p-2 text-center">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold text-foreground">{value}</p>
                        </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CPU Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {s.cpuUsage.map((usage, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Core {index}</span>
                        <span>{usage}%</span>
                      </div>
                      <Progress value={parseFloat(usage)} className="h-2" />
                    </div>
                ))}
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Used</span>
                    <span>{s.memoryUsage.used.toFixed(2)} / {s.memoryUsage.total.toFixed(2)} GB</span>
                  </div>
                  <Progress value={memUsedPercent} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Free</span>
                    <span>{s.memoryUsage.freePercent}%</span>
                  </div>
                  <Progress value={s.memoryUsage.freePercent} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Disk Usage */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Disk Usage (/)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Used</span>
                  <span>{s.diskUsage.used} / {s.diskUsage.total} GB ({s.diskUsage.percent}%)</span>
                </div>
                <Progress value={s.diskUsage.percent} className="h-3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
  );
}
