import { describe, expect, it } from "vitest";
import { evaluateCalculationAnswer, evaluateLogicTraceAnswer, evaluateScenarioDecision, normalizeCalculationInput } from "../shared/course-activity-evaluator";

describe("Rounds shared calculation and logic evaluation", () => {
  it("normalizes safe numeric and percentage inputs without evaluating expressions", () => {
    expect(normalizeCalculationInput(" 40% ")).toBe(40);
    expect(normalizeCalculationInput("1,200")).toBe(1200);
    expect(normalizeCalculationInput("12 / 3")).toBeNull();
    expect(normalizeCalculationInput("forty")).toBeNull();
  });

  it("checks numerical answers using the activity tolerance and provides direct feedback", () => {
    const activity = { expectedAnswer: 40, tolerance: 0.1, explanation: "12 ÷ 30 × 100 = 40%." };
    expect(evaluateCalculationAnswer("40%", activity).outcome).toBe("correct");
    expect(evaluateCalculationAnswer("39.5", activity).outcome).toBe("review");
    expect(evaluateCalculationAnswer("", activity).parsed).toBeNull();
  });

  it("checks a logic choice against the stated rule path", () => {
    const activity = { correctOption: "Show the validation message.", explanation: "The blank field stops the request." };
    expect(evaluateLogicTraceAnswer("Show the validation message.", activity).outcome).toBe("correct");
    expect(evaluateLogicTraceAnswer("Send the request.", activity).outcome).toBe("review");
  });

  it("checks a scenario choice against the stated responsible decision", () => {
    const activity = { bestOption: "Record the source first.", explanation: "The source needs traceable attribution." };
    expect(evaluateScenarioDecision("Record the source first.", activity).outcome).toBe("correct");
    expect(evaluateScenarioDecision("Hide the source.", activity).outcome).toBe("review");
  });
});
