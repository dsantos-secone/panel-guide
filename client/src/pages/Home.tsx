import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import panelDatabaseRaw from "../panelDatabase.json";

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
  const [, setLocation] = useLocation();
  const [database] = useState<Database>(panelDatabaseRaw as Database);
  const [selectedMfg, setSelectedMfg] = useState<string>("");
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [panelData, setPanelData] = useState<PanelModel | null>(null);
  const [seriesData, setSeriesData] = useState<Series | null>(null);
  const [mfgData, setMfgData] = useState<Manufacturer | null>(null);

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
        return "bg-green-50 text-green-700 border border-green-200";
      case "legacy":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "vintage":
        return "bg-slate-100 text-slate-700 border border-slate-300";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-300";
    }
  };

  const getDiscontinuedColor = (discontinued: boolean) => {
    return discontinued
      ? "bg-red-50 border-l-4 border-l-red-600"
      : "bg-white border-l-4 border-l-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2E302E] to-[#1A1C1A] border-b-4 border-[#D02E35] shadow-lg">
        <div className="container py-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663471887591/gHgRgdC7xvvRAFFTCWY7DM/WhiteLogoTall_02b834be.png" 
                alt="Security ONE Logo" 
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-4xl font-bold text-white font-montserrat">
                  SECURITY<span className="text-[#D02E35]">ONE</span>
                </h1>
                <p className="text-slate-300 text-sm mt-1 font-opensans">
                  Technical Tools & Resources
                </p>
              </div>
            </div>
            <div className="text-right text-slate-300 text-sm">
              <p className="font-montserrat font-semibold">Stop Crime Before It Starts™</p>
              <p className="text-xs mt-1">AI Detected. Human Intervened.</p>
            </div>
          </div>
          {/* Navigation */}
          <div className="flex gap-2 border-t border-slate-600 pt-4">
            <Button
              onClick={() => setLocation("/")}
              className="bg-[#D02E35] hover:bg-[#9B2027] text-white font-montserrat font-semibold px-4 py-2"
            >
              Panel Reference
            </Button>
            <Button
              onClick={() => setLocation("/door-access-designer")}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#2E302E] font-montserrat font-semibold px-4 py-2"
            >
              Door Access Designer
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Selector Section */}
        <Card className="mb-8 shadow-md border-0">
          <CardHeader className="bg-[#F5F5F5] border-b border-[#E8E0D0] pb-4">
            <CardTitle className="text-lg text-[#2E302E] font-montserrat">
              Select Your Panel
            </CardTitle>
            <p className="text-sm text-[#757875] mt-1 font-opensans">
              Choose manufacturer, series, and model to view specifications and compatibility
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Manufacturer Select */}
              <div>
                <label className="block text-sm font-semibold text-[#2E302E] mb-2 font-montserrat">
                  1. Manufacturer
                </label>
                <Select value={selectedMfg} onValueChange={setSelectedMfg}>
                  <SelectTrigger className="w-full border-[#E8E0D0] bg-white">
                    <SelectValue placeholder="Select manufacturer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {database &&
                      Object.entries(database.manufacturers).map(([key, mfg]) => (
                        <SelectItem key={key} value={key}>
                          {mfg.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Series Select */}
              <div>
                <label className="block text-sm font-semibold text-[#2E302E] mb-2 font-montserrat">
                  2. Series
                </label>
                <Select
                  value={selectedSeries}
                  onValueChange={setSelectedSeries}
                  disabled={!selectedMfg}
                >
                  <SelectTrigger className="w-full border-[#E8E0D0] bg-white">
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
                <label className="block text-sm font-semibold text-[#2E302E] mb-2 font-montserrat">
                  3. Model
                </label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={!selectedSeries}
                >
                  <SelectTrigger className="w-full border-[#E8E0D0] bg-white">
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
            <Card className="shadow-lg border-0 border-l-4 border-l-[#D02E35]">
              <CardHeader className="pb-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-[#2E302E] font-montserrat">
                      {panelData.code}
                    </CardTitle>
                    <p className="text-[#757875] mt-1 font-opensans">{panelData.name}</p>
                    <p className="text-sm text-[#757875] mt-2 font-opensans">
                      {mfgData.name} • {seriesData.description}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(seriesData.status)} text-xs font-bold px-3 py-1 font-montserrat`}>
                    {seriesData.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F5F5F5]">
                <div className="bg-white p-4 rounded border border-[#E8E0D0]">
                  <p className="text-xs text-[#757875] font-semibold font-montserrat">ZONES</p>
                  <p className="text-2xl font-bold text-[#D02E35] font-montserrat">
                    {panelData.zones}
                  </p>
                </div>
                <div className="bg-white p-4 rounded border border-[#E8E0D0]">
                  <p className="text-xs text-[#757875] font-semibold font-montserrat">
                    WIRELESS
                  </p>
                  <p className="text-lg font-bold text-green-600 font-montserrat">
                    {panelData.wireless ? "Yes" : "Hardwired"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded border border-[#E8E0D0]">
                  <p className="text-xs text-[#757875] font-semibold font-montserrat">
                    RELEASE YEAR
                  </p>
                  <p className="text-2xl font-bold text-[#2E302E] font-montserrat">
                    {panelData.releaseYear}
                  </p>
                </div>
                <div className="bg-white p-4 rounded border border-[#E8E0D0]">
                  <p className="text-xs text-[#757875] font-semibold font-montserrat">
                    EOL RESISTOR
                  </p>
                  <p className="text-lg font-bold text-[#D02E35] font-montserrat">
                    {panelData.eolResistor}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {panelData.notes && (
              <Alert className="border-[#2C3E50] bg-[#2C3E50] border-0">
                <Info className="h-4 w-4 text-white" />
                <AlertDescription className="text-white font-opensans">
                  {panelData.notes}
                </AlertDescription>
              </Alert>
            )}

            {/* Peripherals Section */}
            {mfgData.peripherals && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#2E302E] font-montserrat">
                  Compatible Peripherals
                </h2>

                {Object.entries(mfgData.peripherals).map(([category, items]) => (
                  <Card key={category} className="shadow-md border-0">
                    <CardHeader className="bg-[#F5F5F5] border-b border-[#E8E0D0] pb-3">
                      <CardTitle className="text-lg text-[#2E302E] font-montserrat">
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
                                  <p className="font-mono font-bold text-[#D02E35] text-lg font-montserrat">
                                    {item.code}
                                  </p>
                                  <p className="font-semibold text-[#2E302E] font-opensans">
                                    {item.name}
                                  </p>
                                </div>
                                {item.discontinued && (
                                  <Badge className="bg-[#D02E35] text-white text-xs font-montserrat">
                                    DISCONTINUED
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs font-opensans">
                                  {item.type}
                                </Badge>
                              </div>
                              {item.replacement && (
                                <Alert className="border-amber-200 bg-amber-50 mt-2 border-0 border-l-4 border-l-amber-600">
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                  <AlertDescription className="text-amber-900 text-sm font-opensans">
                                    <strong>Replacement:</strong> {item.replacement}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          ))}
                        {items.filter((item) =>
                          item.compatibility.includes(panelData.code)
                        ).length === 0 && (
                          <p className="text-[#757875] italic font-opensans">
                            No {category.toLowerCase()} listed for this model.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Radio Compatibility Matrix */}
            {database && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#2E302E] font-montserrat">
                  Radio Compatibility
                </h2>

                {/* LTE Radios */}
                <Card className="shadow-md border-0">
                  <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                    <CardTitle className="text-lg text-green-900 font-montserrat">
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
                              <p className="font-mono font-bold text-green-700 text-lg font-montserrat">
                                {radio.radioModel}
                              </p>
                              <p className="font-semibold text-[#2E302E] font-opensans">
                                {radio.technology}
                              </p>
                            </div>
                            <Badge className="bg-green-600 text-white text-xs font-montserrat">
                              {radio.carrier}
                            </Badge>
                          </div>
                          {radio.replaces && radio.replaces.length > 0 && (
                            <p className="text-sm text-[#757875] font-opensans">
                              <strong>Replaces:</strong> {radio.replaces.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                      {database.radioCompatibilityMatrix.LTE.filter((radio) =>
                        radio.compatiblePanels.includes(panelData.code)
                      ).length === 0 && (
                        <p className="text-[#757875] italic font-opensans">
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
                  <Card className="shadow-md border-0 border-l-4 border-l-[#D02E35]">
                    <CardHeader className="bg-red-50 border-b border-red-200 pb-3">
                      <CardTitle className="text-lg text-red-900 font-montserrat">
                        Deprecated 3G Radios (Sunset)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Alert className="border-red-300 bg-red-50 mb-4 border-0 border-l-4 border-l-red-600">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-900 font-opensans">
                          3G networks have been sunset. Upgrade to LTE immediately for continued service.
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
                                  <p className="font-mono font-bold text-red-700 text-lg font-montserrat">
                                    {radio.radioModel}
                                  </p>
                                  <p className="font-semibold text-[#2E302E] font-opensans">
                                    {radio.technology}
                                  </p>
                                </div>
                                <Badge className="bg-red-600 text-white text-xs font-montserrat">
                                  DEPRECATED
                                </Badge>
                              </div>
                              <p className="text-sm text-[#757875] mb-2 font-opensans">
                                <strong>Upgrade to:</strong> {radio.replacedBy}
                              </p>
                              <Alert className="border-amber-200 bg-amber-50 border-0 border-l-4 border-l-amber-600">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-900 text-sm font-opensans">
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
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => window.open(mfgData.url, "_blank")}
                className="gap-2 bg-[#D02E35] hover:bg-[#9B2027] text-white font-montserrat font-semibold"
              >
                Visit {mfgData.name} <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!panelData && (
          <Card className="shadow-md border-0">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-[#D02E35] rounded-lg mx-auto mb-4 opacity-30 flex items-center justify-center">
                <span className="text-white font-bold text-2xl font-montserrat">S1</span>
              </div>
              <p className="text-[#757875] text-lg font-opensans">
                Select a manufacturer, series, and model to view panel specifications and compatibility information.
              </p>
              <p className="text-sm text-[#757875] mt-2 font-opensans">
                Stop Crime Before It Starts™ — AI Detected. Human Intervened.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#2E302E] text-[#F5F5F5] mt-16 border-t-4 border-[#D02E35]">
        <div className="container py-8 text-center text-sm font-opensans">
          <p className="font-montserrat font-semibold mb-2">SECURITY ONE | Technical Reference Guide</p>
          <p>Protecting Southern Ontario for 45+ years</p>
          <p className="text-[#757875] mt-2">Built on Innovation. Rooted in Community.</p>
        </div>
      </footer>
    </div>
  );
}
