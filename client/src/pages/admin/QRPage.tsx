import { useState } from "react";
import QRCode from "qrcode";
import { QrCode, DownloadSimple, Printer } from "@phosphor-icons/react";
import { useAssets } from "@/hooks/useAssets";
import {
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TdEmpty,
} from "@/components/ui/Table";
import { IdTag, StatusPill } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

async function downloadQR(assetCode: string, assetId: string) {
  const value = `${window.location.origin}/assets/${assetId}`;
  const dataUrl = await QRCode.toDataURL(value, {
    width: 512,
    margin: 2,
    color: { dark: "#0E1116", light: "#FFFFFF" },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `qr-${assetCode}.png`;
  a.click();
}

export function QRPage() {
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const { data, isLoading } = useAssets({ perPage: 999 });
  const assets = (data?.data ?? []).filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDownload = async (assetCode: string, assetId: string) => {
    setDownloading(assetId);
    try {
      await downloadQR(assetCode, assetId);
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">
            Labels
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">
            QR Codes
          </h1>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 h-[26px] px-2.5 text-[12px] font-medium rounded border border-af-border bg-white hover:bg-af-ink-050 transition-colors duration-[120ms]"
        >
          <Printer size={12} />
          Print all
        </button>
      </div>

      <div className="flex items-center gap-1.5 bg-white border border-af-border rounded px-2.5 py-1.5 w-64 text-[12px] text-af-muted">
        <QrCode size={13} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets…"
          className="flex-1 bg-transparent outline-none text-af-fg placeholder:text-af-subtle text-[12px]"
        />
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={<QrCode size={28} />}
          title="No assets"
          description="Add assets to generate QR codes."
        />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Asset code</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>QR</Th>
            </tr>
          </Thead>
          <Tbody>
            {assets.length === 0 ? (
              <TdEmpty cols={5} message="No assets match" />
            ) : (
              assets.map((asset) => (
                <Tr key={asset.id}>
                  <Td>
                    <IdTag>{asset.assetCode}</IdTag>
                  </Td>
                  <Td>
                    <span className="font-medium text-[13px]">
                      {asset.name}
                    </span>
                  </Td>
                  <Td muted>{asset.category?.name ?? "—"}</Td>
                  <Td>
                    <StatusPill status={asset.status} />
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleDownload(asset.assetCode, asset.id)}
                      disabled={downloading === asset.id}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-1 rounded border border-af-border hover:bg-af-ink-050 text-af-muted transition-colors duration-[120ms] disabled:opacity-50"
                    >
                      <DownloadSimple size={11} />
                      {downloading === asset.id ? "…" : "Download"}
                    </button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
