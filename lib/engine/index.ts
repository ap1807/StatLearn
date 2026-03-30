/**
 * Core Statistical Engine
 * Handles data ingestion simulation, analysis, and insight generation.
 */

export interface ScenarioInput {
  distance: number;
  classType: string;
  depDelay: number;
  arrDelay: number;
  travelType: string;
}

export interface AnalysisResult {
  probabilityOfDissatisfaction: number;
  confidenceScore: number;
  primaryFactor: string;
  contributingFactors: { factor: string; impact: number; type: 'negative' | 'positive' }[];
  explanation: string;
  mitigation: string;
  expectedImprovement: number;
  isHighRisk: boolean;
  proTip: string;
  nextBestAction: string;
  reasoning: {
    what: string;
    why: string;
    next: string;
  };
}

export const StatisticalEngine = {
  /**
   * Simulates real-time data ingestion and applies statistical reasoning
   * to predict passenger satisfaction based on input parameters.
   */
  analyzeScenario: (input: ScenarioInput): AnalysisResult => {
    const totalDelay = input.depDelay + input.arrDelay;
    let dissatisfactionProb = 0.05; // Base baseline
    const contributingFactors: { factor: string; impact: number; type: 'negative' | 'positive' }[] = [];

    // Delay impact (non-linear)
    if (totalDelay > 120) {
      dissatisfactionProb += 0.65;
      contributingFactors.push({ factor: 'Extreme Delay (>2h)', impact: 65, type: 'negative' });
    } else if (totalDelay > 60) {
      dissatisfactionProb += 0.35;
      contributingFactors.push({ factor: 'Significant Delay (>1h)', impact: 35, type: 'negative' });
    } else if (totalDelay > 30) {
      dissatisfactionProb += 0.15;
      contributingFactors.push({ factor: 'Minor Delay (>30m)', impact: 15, type: 'negative' });
    }

    // Class impact
    if (input.classType === 'Economy') {
      dissatisfactionProb += 0.12;
      contributingFactors.push({ factor: 'Economy Seating', impact: 12, type: 'negative' });
    } else if (input.classType === 'First Class') {
      dissatisfactionProb -= 0.10; // Buffer against delays
      contributingFactors.push({ factor: 'Premium Service Buffer', impact: 10, type: 'positive' });
    }

    // Distance impact (fatigue multiplier)
    if (input.distance > 3000) {
      dissatisfactionProb *= 1.2;
      contributingFactors.push({ factor: 'Long-haul Fatigue', impact: 20, type: 'negative' });
    } else if (input.distance > 1000) {
      dissatisfactionProb *= 1.1;
      contributingFactors.push({ factor: 'Medium-haul Duration', impact: 10, type: 'negative' });
    }

    // Travel type nuances
    if (input.travelType === 'Business' && totalDelay > 45) {
      dissatisfactionProb += 0.15; // Business travelers are more sensitive to delays
      contributingFactors.push({ factor: 'Business Schedule Sensitivity', impact: 15, type: 'negative' });
    }

    // Cap probability
    dissatisfactionProb = Math.min(0.99, Math.max(0.01, dissatisfactionProb));

    // Confidence score (simulated based on data density)
    let confidenceScore = 85;
    if (totalDelay > 180) confidenceScore = 94; // Extreme cases have more historical data
    if (input.distance < 500) confidenceScore = 72; // Short haul data is more volatile

    // Determine primary factor
    let primaryFactor = 'General Fatigue';
    if (totalDelay > 60) primaryFactor = 'Arrival Delay';
    else if (input.classType === 'Economy' && input.distance > 2000) primaryFactor = 'Seat Comfort / Duration';

    // Explanation
    let explanation = `The predicted dissatisfaction is primarily driven by the ${totalDelay} minute delay. `;
    if (input.travelType === 'Business') {
      explanation += `Business travelers have a lower tolerance for delays due to tight scheduling. `;
    }
    if (input.classType === 'Economy') {
      explanation += `Economy seating compounding with long distance (${input.distance} miles) increases physical fatigue.`;
    }

    // Determine mitigation
    let mitigation = 'Standard Recovery';
    let expectedImprovement = 5;
    if (totalDelay > 120) {
      mitigation = 'Proactive Rebooking / Compensation';
      expectedImprovement = 25;
    } else if (input.classType === 'Economy') {
      mitigation = 'Class Upgrade / Lounge Access';
      expectedImprovement = 18;
    } else {
      mitigation = 'Personalized Apology & Amenities';
      expectedImprovement = 12;
    }

    // Pro tip generation based on context
    let proTip = 'Travelers on this route are 40% more likely to report satisfaction if "In-flight Wifi" is rated 4 or higher.';
    if (input.travelType === 'Business') {
      proTip = 'Business travelers value rapid rebooking options 3x more than meal vouchers during delays.';
    } else if (input.distance > 3000) {
      proTip = 'For ultra-long haul, cabin humidity and noise levels become primary drivers of NPS after hour 6.';
    }

    // Next Best Action
    let nextBestAction = 'Monitor flight status and prepare standard recovery vouchers.';
    if (dissatisfactionProb > 0.6) {
      nextBestAction = 'Immediately trigger proactive compensation workflow for all passengers.';
    } else if (input.travelType === 'Business' && totalDelay > 30) {
      nextBestAction = 'Prioritize lounge access for business class passengers to mitigate schedule frustration.';
    }

    const reasoning = {
      what: `Predicted dissatisfaction risk is ${Math.round(dissatisfactionProb * 100)}%.`,
      why: `This is primarily due to the ${totalDelay} minute delay affecting ${input.travelType} travel expectations.`,
      next: nextBestAction
    };

    return {
      probabilityOfDissatisfaction: Math.round(dissatisfactionProb * 100),
      confidenceScore,
      primaryFactor,
      contributingFactors,
      explanation,
      mitigation,
      expectedImprovement,
      isHighRisk: dissatisfactionProb > 0.7,
      proTip,
      nextBestAction,
      reasoning
    };
  },

  simulateImpact: (currentResult: AnalysisResult): { newProb: number; improvement: number } => {
    const improvement = currentResult.expectedImprovement;
    const newProb = Math.max(1, currentResult.probabilityOfDissatisfaction - improvement);
    return { newProb, improvement };
  }
};
