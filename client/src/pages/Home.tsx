import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PanelModel {
  code: string;
  name: string;
  zones: number;
  wireless: boolean;
  releaseYear: number;
  eolResistor: string;
  notes?: string;
}

interface Peripheral {
  code: string;
  name: string;
  type: string;
  compatibility: string[];
  discontinued: boolean;
  replacement: string | null;
}

interface Series {
  status: string;
  releaseYear: number;
  description: string;
  models: PanelModel[];
}

interface Manufacturer {
  name: string;
  url: string;
  series: Record<string, Series>;
  peripherals?: Record<string, Peripheral[]>;
}

interface Database {
  manufacturers: Record<string, Manufacturer>;
  radioCompatibilityMatrix: {
    LTE: Array<{
      radioModel: string;
      carrier: string;
      technology: string;
      compatiblePanels: string[];
      replacedBy: string | null;
      replaces: string[];
    }>;
    "3G_Deprecated": Array<{
      radioModel: string;
      carrier: string;
      technology: string;
      compatiblePanels: string[];
      replacedBy: string;
      replaces: string[] | null;
      deprecationNote: string;
    }>;
  };
}

export default function Home() {
  const [database, setDatabase] = useState<Database | null>(null);
  const [selectedMfg, setSelectedMfg] = useState<string>("");
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [panelData, setPanelData] = useState<PanelModel | null>(null);
  const [seriesData, setSeriesData] = useState<Series | null>(null);
  const [mfgData, setMfgData] = useState<Manufacturer | null>(null);

  // Load database
  useEffect(() => {
    const loadDatabase = async () => {
      try {
        // Import the database directly
        const data = await import("../panelDatabase.json");
        setDatabase(data.default || data);
      } catch (error) {
        console.error("Failed to load database:", error);
      }
    };
    loadDatabase();
  }, []);

  // Reset dependent selects when manufacturer changes
  useEffect(() => {
    setSelectedSeries("");
    setSelectedModel("");
    setPanelData(null);
    setSeriesData(null);
    if (selectedMfg && database) {
      setMfgData(database.manufacturers[selectedMfg]);
    }
  }, [selectedMfg, database]);

  // Reset model when series changes
  useEffect(() => {
    setSelectedModel("");
    setPanelData(null);
    if (selectedSeries && mfgData) {
      setSeriesData(mfgData.series[selectedSeries]);
    }
  }, [selectedSeries, mfgData]);

  // Load panel data when model changes
  useEffect(() => {
    if (selectedModel && seriesData) {
      const model = seriesData.models.find((m) => m.code === selectedModel);
      if (model) {
        setPanelData(model);
      }
    }
  }, [selectedModel, seriesData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "legacy":
        return "bg-yellow-100 text-yellow-800";
      case "vintage":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDiscontinuedColor = (discontinued: boolean) => {
    return discontinued
      ? "bg-red-50 border-red-200"
      : "bg-white border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-4 border-red-600 shadow-lg">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                SECURITY<span className="text-red-500">ONE</span>
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Comprehensive Panel Reference Guide v25
              </p>
            </div>
            <div className="text-right text-slate-300 text-sm">
              <p>Complete Database</p>
              <p>1980 - Present</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Selector Section */}
        <Card className="mb-8 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Panel Selector</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Manufacturer Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  1. Manufacturer
                </label>
                <Select value={selectedMfg} onValueChange={setSelectedMfg}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select manufacturer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {database &&
                      Object.entries(database.manufacturers).map(
                        ([key, mfg]) => (
                          <SelectItem key={key} value={key}>
                            {mfg.name}
                          </SelectItem>
                        )
                      )}
                  </SelectContent>
                </Select>
              </div>

              {/* Series Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  2. Series
                </label>
                <Select
                  value={selectedSeries}
                  onValueChange={setSelectedSeries}
                  disabled={!selectedMfg}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select series..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mfgData &&
                      Object.entries(mfgData.series).map(([key, series]) => (
                        <SelectItem key={key} value={key}>
                          {key} ({series.releaseYear}+)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  3. Model
                </label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={!selectedSeries}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {seriesData &&
                      seriesData.models.map((model) => (
                        <SelectItem key={model.code} value={model.code}>
                          {model.code} - {model.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel Details */}
        {panelData && seriesData && mfgData && (
          <div className="space-y-6">
            {/* Panel Header Card */}
            <Card className="shadow-lg border-l-4 border-l-red-600">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-slate-900">
                      {panelData.code}
                    </CardTitle>
                    <p className="text-slate-600 mt-1">{panelData.name}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      {mfgData.name} • {seriesData.description}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(seriesData.status)} text-xs font-bold px-3 py-1`}>
                    {seriesData.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-xs text-slate-600 font-semibold">ZONES</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {panelData.zones}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-xs text-slate-600 font-semibold">
                    WIRELESS
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {panelData.wireless ? "Yes" : "Hardwired"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-xs text-slate-600 font-semibold">
                    RELEASE YEAR
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {panelData.releaseYear}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-xs text-slate-600 font-semibold">
                    EOL RESISTOR
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {panelData.eolResistor}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {panelData.notes && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  {panelData.notes}
                </AlertDescription>
              </Alert>
            )}

            {/* Peripherals Section */}
            {mfgData.peripherals && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Compatible Peripherals
                </h2>

                {Object.entries(mfgData.peripherals).map(
                  ([category, items]) => (
                    <Card key={category} className="shadow-md">
                      <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-lg text-slate-900">
                          {category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {items
                            .filter((item) =>
                              item.compatibility.includes(panelData.code)
                            )
                            .map((item) => (
                              <div
                                key={item.code}
                                className={`p-4 rounded border-2 transition-all ${getDiscontinuedColor(item.discontinued)}`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-mono font-bold text-red-600 text-lg">
                                      {item.code}
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                      {item.name}
                                    </p>
                                  </div>
                                  {item.discontinued && (
                                    <Badge className="bg-red-600 text-white text-xs">
                                      DISCONTINUED
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {item.type}
                                  </Badge>
                                </div>
                                {item.replacement && (
                                  <Alert className="border-amber-200 bg-amber-50 mt-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-amber-900 text-sm">
                                      <strong>Replacement:</strong>{" "}
                                      {item.replacement}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            ))}
                          {items.filter((item) =>
                            item.compatibility.includes(panelData.code)
                          ).length === 0 && (
                            <p className="text-slate-500 italic">
                              No {category.toLowerCase()} listed for this model.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}

            {/* Radio Compatibility Matrix */}
            {database && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Radio Compatibility
                </h2>

                {/* LTE Radios */}
                <Card className="shadow-md">
                  <CardHeader className="bg-green-50 border-b pb-3">
                    <CardTitle className="text-lg text-green-900">
                      LTE Communicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {database.radioCompatibilityMatrix.LTE.filter((radio) =>
                        radio.compatiblePanels.includes(panelData.code)
                      ).map((radio) => (
                        <div
                          key={radio.radioModel}
                          className="p-4 rounded border-2 border-green-200 bg-green-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-mono font-bold text-green-700 text-lg">
                                {radio.radioModel}
                              </p>
                              <p className="font-semibold text-slate-900">
                                {radio.technology}
                              </p>
                            </div>
                            <Badge className="bg-green-600 text-white text-xs">
                              {radio.carrier}
                            </Badge>
                          </div>
                          {radio.replaces && radio.replaces.length > 0 && (
                            <p className="text-sm text-slate-600">
                              <strong>Replaces:</strong> {radio.replaces.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                      {database.radioCompatibilityMatrix.LTE.filter((radio) =>
                        radio.compatiblePanels.includes(panelData.code)
                      ).length === 0 && (
                        <p className="text-slate-500 italic">
                          No LTE radios listed for this model.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Deprecated 3G Radios */}
                {database.radioCompatibilityMatrix["3G_Deprecated"].some(
                  (radio) =>
                    radio.compatiblePanels.includes(panelData.code)
                ) && (
                  <Card className="shadow-md border-l-4 border-l-red-600">
                    <CardHeader className="bg-red-50 border-b pb-3">
                      <CardTitle className="text-lg text-red-900">
                        Deprecated 3G Radios (Sunset)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Alert className="border-red-300 bg-red-50 mb-4">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-900">
                          3G networks have been sunset. Upgrade to LTE
                          immediately for continued service.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-3">
                        {database.radioCompatibilityMatrix["3G_Deprecated"]
                          .filter((radio) =>
                            radio.compatiblePanels.includes(panelData.code)
                          )
                          .map((radio) => (
                            <div
                              key={radio.radioModel}
                              className="p-4 rounded border-2 border-red-200 bg-red-50"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-mono font-bold text-red-700 text-lg">
                                    {radio.radioModel}
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {radio.technology}
                                  </p>
                                </div>
                                <Badge className="bg-red-600 text-white text-xs">
                                  DEPRECATED
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                <strong>Upgrade to:</strong> {radio.replacedBy}
                              </p>
                              <Alert className="border-amber-200 bg-amber-50">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-900 text-sm">
                                  {radio.deprecationNote}
                                </AlertDescription>
                              </Alert>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Manufacturer Link */}
            <div className="flex justify-center">
              <Button
                onClick={() => window.open(mfgData.url, "_blank")}
                className="gap-2 bg-slate-900 hover:bg-slate-800"
              >
                Visit {mfgData.name} <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!panelData && (
          <Card className="shadow-md">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-500 text-lg">
                Select a manufacturer, series, and model to view panel details.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
