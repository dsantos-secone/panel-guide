import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  ChevronLeft,
  Lock,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import doorAccessData from "../doorAccessDesigner.json";

interface FormData {
  [key: string]: string | string[];
}

interface Question {
  id: string;
  question: string;
  type: "select" | "checkbox" | "radio";
  required: boolean;
  options: Array<{ value: string; label: string }>;
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function DoorAccessDesigner() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [showSummary, setShowSummary] = useState(false);

  const sections: Section[] = doorAccessData.sections as Section[];
  const currentSection = sections[currentSectionIndex];

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isSectionComplete = useMemo(() => {
    return currentSection.questions.every((q) => {
      const value = formData[q.id];
      return value && (Array.isArray(value) ? value.length > 0 : value !== "");
    });
  }, [currentSection, formData]);

  const isFormComplete = useMemo(() => {
    return sections.every((section) =>
      section.questions.every((q) => {
        const value = formData[q.id];
        return value && (Array.isArray(value) ? value.length > 0 : value !== "");
      })
    );
  }, [sections, formData]);

  const handleNext = () => {
    if (isSectionComplete && currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleComplete = () => {
    if (isFormComplete) {
      setShowSummary(true);
    }
  };

  const getRecommendation = () => {
    const clientType = formData.client_type;
    const numDoors = formData.num_doors;
    const totalUsers = formData.total_users;

    if (clientType === "residential" || (numDoors === "1" && totalUsers === "1_5")) {
      return doorAccessData.recommendations.entry_level;
    } else if (
      clientType === "small_business" ||
      clientType === "retail" ||
      numDoors === "2_3"
    ) {
      return doorAccessData.recommendations.small_business;
    } else {
      return doorAccessData.recommendations.enterprise;
    }
  };

  const recommendation = getRecommendation();

  const downloadSummary = () => {
    const summary = generateSummaryText();
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(summary)
    );
    element.setAttribute("download", "door_access_design_summary.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateSummaryText = () => {
    let summary = "SECURITY ONE - DOOR ACCESS SYSTEM DESIGN SUMMARY\n";
    summary += "=".repeat(60) + "\n\n";

    sections.forEach((section) => {
      summary += `${section.title.toUpperCase()}\n`;
      summary += "-".repeat(40) + "\n";

      section.questions.forEach((question) => {
        const value = formData[question.id];
        if (value) {
          let displayValue = "";
          if (Array.isArray(value)) {
            displayValue = value
              .map((v) => question.options.find((o) => o.value === v)?.label)
              .join(", ");
          } else {
            displayValue =
              question.options.find((o) => o.value === value)?.label || value;
          }
          summary += `${question.question}\n  → ${displayValue}\n\n`;
        }
      });

      summary += "\n";
    });

    summary += `RECOMMENDED SOLUTION\n`;
    summary += "-".repeat(40) + "\n";
    summary += `${recommendation.name}\n`;
    summary += `${recommendation.description}\n\n`;
    summary += `Estimated Cost: ${recommendation.estimated_cost}\n\n`;
    summary += `Components:\n`;
    recommendation.components.forEach((comp) => {
      summary += `  • ${comp}\n`;
    });
    summary += `\nKey Features:\n`;
    recommendation.features.forEach((feat) => {
      summary += `  • ${feat}\n`;
    });

    return summary;
  };

  if (showSummary) {
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
                    DOOR ACCESS<span className="text-[#D02E35]">DESIGNER</span>
                  </h1>
                  <p className="text-slate-300 text-sm mt-1 font-opensans">
                    Design Summary & Recommendation
                  </p>
                </div>
              </div>
              <div className="text-right text-slate-300 text-sm">
                <p className="font-montserrat font-semibold">Stop Crime Before It Starts™</p>
                <p className="text-xs mt-1">AI Detected. Human Intervened.</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-8">
          {/* Recommendation Card */}
          <Card className="shadow-lg border-0 border-l-4 border-l-[#D02E35] mb-8">
            <CardHeader className="bg-gradient-to-r from-[#D02E35] to-[#9B2027] text-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-montserrat">
                    {recommendation.name}
                  </CardTitle>
                  <p className="text-slate-100 mt-2 font-opensans">
                    {recommendation.description}
                  </p>
                </div>
                <CheckCircle2 className="w-16 h-16 text-white opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost */}
                <div className="bg-[#F5F5F5] p-6 rounded-lg border-2 border-[#E8E0D0]">
                  <p className="text-sm font-semibold text-[#757875] font-montserrat mb-2">
                    ESTIMATED COST
                  </p>
                  <p className="text-3xl font-bold text-[#D02E35] font-montserrat">
                    {recommendation.estimated_cost}
                  </p>
                </div>

                {/* Best For */}
                <div className="bg-[#F5F5F5] p-6 rounded-lg border-2 border-[#E8E0D0]">
                  <p className="text-sm font-semibold text-[#757875] font-montserrat mb-3">
                    BEST FOR
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.best_for.map((type: string) => (
                      <Badge
                        key={type}
                        className="bg-[#2C3E50] text-white font-opensans"
                      >
                        {type.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Components */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-[#2E302E] font-montserrat mb-4">
                  Recommended Components
                </h3>
                <div className="bg-white border-2 border-[#E8E0D0] rounded-lg p-6">
                  <ul className="space-y-3">
                    {recommendation.components.map((comp: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 font-opensans"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-[#2E302E]">{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-[#2E302E] font-montserrat mb-4">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendation.features.map((feat: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-[#2E302E] text-sm font-opensans">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Responses Summary */}
          <Card className="shadow-md border-0 mb-8">
            <CardHeader className="bg-[#F5F5F5] border-b border-[#E8E0D0] pb-4">
              <CardTitle className="text-lg text-[#2E302E] font-montserrat">
                Client Requirements Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id}>
                    <h4 className="font-bold text-[#2E302E] mb-3 font-montserrat">
                      {section.title}
                    </h4>
                    <div className="space-y-2 ml-4">
                      {section.questions.map((question) => {
                        const value = formData[question.id];
                        if (!value) return null;

                        let displayValue = "";
                        if (Array.isArray(value)) {
                          displayValue = value
                            .map(
                              (v) =>
                                question.options.find((o) => o.value === v)
                                  ?.label
                            )
                            .join(", ");
                        } else {
                          displayValue =
                            question.options.find((o) => o.value === value)
                              ?.label || value;
                        }

                        return (
                          <div
                            key={question.id}
                            className="text-sm font-opensans"
                          >
                            <p className="text-[#757875] font-semibold">
                              {question.question}
                            </p>
                            <p className="text-[#2E302E] ml-2">→ {displayValue}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <Button
              onClick={() => {
                setShowSummary(false);
                setCurrentSectionIndex(0);
              }}
              variant="outline"
              className="gap-2 border-[#D02E35] text-[#D02E35] hover:bg-red-50 font-montserrat font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              Start Over
            </Button>
            <Button
              onClick={downloadSummary}
              className="gap-2 bg-[#D02E35] hover:bg-[#9B2027] text-white font-montserrat font-semibold"
            >
              <Download className="w-4 h-4" />
              Download Summary
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#2E302E] text-[#F5F5F5] mt-16 border-t-4 border-[#D02E35]">
          <div className="container py-8 text-center text-sm font-opensans">
            <p className="font-montserrat font-semibold mb-2">
              SECURITY ONE | Door Access System Designer
            </p>
            <p>Protecting Southern Ontario for 45+ years</p>
            <p className="text-[#757875] mt-2">Built on Innovation. Rooted in Community.</p>
          </div>
        </footer>
      </div>
    );
  }

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
                  DOOR ACCESS<span className="text-[#D02E35]">DESIGNER</span>
                </h1>
                <p className="text-slate-300 text-sm mt-1 font-opensans">
                  Interactive Sales Design Tool
                </p>
              </div>
            </div>
            <div className="text-right text-slate-300 text-sm">
              <p className="font-montserrat font-semibold">Stop Crime Before It Starts™</p>
              <p className="text-xs mt-1">AI Detected. Human Intervened.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#2E302E] font-montserrat">
                {currentSection.title}
              </h2>
              <p className="text-[#757875] mt-1 font-opensans">
                {currentSection.description}
              </p>
            </div>
            <Badge className="bg-[#D02E35] text-white text-lg px-4 py-2 font-montserrat">
              Step {currentSectionIndex + 1} of {sections.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#E8E0D0] rounded-full h-2">
            <div
              className="bg-[#D02E35] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentSectionIndex + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Questions Card */}
        <Card className="shadow-lg border-0 mb-8">
          <CardContent className="pt-8">
            <div className="space-y-8">
              {currentSection.questions.map((question) => (
                <div key={question.id} className="border-b border-[#E8E0D0] pb-8 last:border-0">
                  <div className="flex items-start gap-2 mb-4">
                    <Label className="text-lg font-semibold text-[#2E302E] font-montserrat">
                      {question.question}
                    </Label>
                    {question.required && (
                      <span className="text-[#D02E35] font-bold">*</span>
                    )}
                  </div>

                  {/* Select/Radio Questions */}
                  {(question.type === "select" || question.type === "radio") && (
                    <RadioGroup
                      value={
                        (formData[question.id] as string) || ""
                      }
                      onValueChange={(value) =>
                        handleInputChange(question.id, value)
                      }
                    >
                      <div className="space-y-3 ml-2">
                        {question.options.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`${question.id}-${option.value}`}
                              className="border-[#D02E35]"
                            />
                            <Label
                              htmlFor={`${question.id}-${option.value}`}
                              className="cursor-pointer font-opensans text-[#2E302E]"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {/* Checkbox Questions */}
                  {question.type === "checkbox" && (
                    <div className="space-y-3 ml-2">
                      {question.options.map((option) => {
                        const isChecked = (
                          formData[question.id] as string[]
                        )?.includes(option.value);
                        return (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                          >
                            <Checkbox
                              id={`${question.id}-${option.value}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = (
                                  formData[question.id] as string[]
                                ) || [];
                                if (checked) {
                                  handleInputChange(question.id, [
                                    ...current,
                                    option.value,
                                  ]);
                                } else {
                                  handleInputChange(
                                    question.id,
                                    current.filter((v) => v !== option.value)
                                  );
                                }
                              }}
                              className="border-[#D02E35]"
                            />
                            <Label
                              htmlFor={`${question.id}-${option.value}`}
                              className="cursor-pointer font-opensans text-[#2E302E]"
                            >
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Alert */}
        {!isSectionComplete && (
          <Alert className="border-amber-300 bg-amber-50 mb-8 border-0 border-l-4 border-l-amber-600">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 font-opensans">
              Please answer all questions in this section before proceeding.
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            variant="outline"
            className="gap-2 border-[#D02E35] text-[#D02E35] hover:bg-red-50 font-montserrat font-semibold disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentSectionIndex < sections.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isSectionComplete}
              className="gap-2 bg-[#D02E35] hover:bg-[#9B2027] text-white font-montserrat font-semibold disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!isFormComplete}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white font-montserrat font-semibold disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              View Recommendation
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2E302E] text-[#F5F5F5] mt-16 border-t-4 border-[#D02E35]">
        <div className="container py-8 text-center text-sm font-opensans">
          <p className="font-montserrat font-semibold mb-2">
            SECURITY ONE | Door Access System Designer
          </p>
          <p>Protecting Southern Ontario for 45+ years</p>
          <p className="text-[#757875] mt-2">Built on Innovation. Rooted in Community.</p>
        </div>
      </footer>
    </div>
  );
}
