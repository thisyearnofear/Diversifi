import React from "react";
import type { Region } from "../hooks/use-user-region";
import { RegionalPattern } from "./RegionalIconography";

interface RealLifeScenarioProps {
  region: Region;
  scenarioType: "education" | "remittance" | "business" | "travel" | "savings";
  inflationRate?: number;
  amount?: number;
}

/**
 * Component that displays real-life scenarios showing how inflation affects daily life
 * and how stablecoin diversification can help
 */
export default function RealLifeScenario({
  region,
  scenarioType,
  inflationRate = 5,
  amount = 1000,
}: RealLifeScenarioProps) {
  // Calculate the impact of inflation on the amount over 1 year
  const valueAfterInflation = amount * (1 - inflationRate / 100);
  const lostValue = amount - valueAfterInflation;

  // Get scenario-specific content
  const getScenarioContent = () => {
    switch (scenarioType) {
      case "education":
        return {
          title: "Education Expenses",
          icon: "🎓",
          description: getEducationScenario(region, lostValue),
          action: "Protect your education fund",
        };
      case "remittance":
        return {
          title: "Family Support",
          icon: "👪",
          description: getRemittanceScenario(region, lostValue),
          action: "Protect your remittance value",
        };
      case "business":
        return {
          title: "Business Operations",
          icon: "🏪",
          description: getBusinessScenario(region, lostValue),
          action: "Protect your business funds",
        };
      case "travel":
        return {
          title: "Travel Plans",
          icon: "✈️",
          description: getTravelScenario(region, lostValue),
          action: "Protect your travel budget",
        };
      case "savings":
        return {
          title: "Savings Goals",
          icon: "💰",
          description: getSavingsScenario(region, lostValue),
          action: "Protect your savings",
        };
      default:
        return {
          title: "Daily Expenses",
          icon: "🛒",
          description: `With ${inflationRate}% inflation, your ${amount} will lose ${lostValue.toFixed(
            2
          )} in purchasing power over a year.`,
          action: "Protect your money",
        };
    }
  };

  const scenarioContent = getScenarioContent();

  return (
    <div className="relative overflow-hidden rounded-card border border-gray-200 bg-white p-4 shadow-sm">
      <RegionalPattern region={region} />
      <div className="relative">
        <div className="flex items-center mb-2">
          <span
            className="text-2xl mr-2"
            role="img"
            aria-label={scenarioContent.title}
          >
            {scenarioContent.icon}
          </span>
          <h3 className="font-medium text-text-primary">
            {scenarioContent.title}
          </h3>
        </div>

        <p className="text-sm text-text-secondary mb-3">
          {scenarioContent.description}
        </p>

        <div className="flex justify-between items-center">
          <div className="text-sm flex items-center">
            <span className="font-medium text-accent-error">
              ${lostValue.toFixed(0)}
            </span>
            <span className="flex flex-col ml-1 leading-tight">
              <span className="text-text-secondary">lost to inflation</span>
              <span className="text-xs text-text-muted">
                per year (12 months)
              </span>
            </span>
          </div>
          <button
            className={`px-3 py-1 text-xs rounded-full bg-region-${region.toLowerCase()}-light text-region-${region.toLowerCase()}-dark font-medium`}
          >
            {scenarioContent.action}
          </button>
        </div>
      </div>
    </div>
  );
}

// Region-specific education scenarios
function getEducationScenario(region: Region, lostValue: number): string {
  switch (region) {
    case "Africa":
      return `Inflation could reduce your child's school supplies budget by $${lostValue.toFixed(
        0
      )} this year, affecting their education quality.`;
    case "USA":
      return `Your college savings will lose $${lostValue.toFixed(
        0
      )} to inflation this year, potentially reducing future educational opportunities.`;
    case "Europe":
      return `Your university fund will lose $${lostValue.toFixed(
        0
      )} in value, which could mean fewer textbooks or resources for your studies.`;
    case "LatAm":
      return `High inflation could reduce your education budget by $${lostValue.toFixed(
        0
      )}, making it harder to afford quality courses or materials.`;
    case "Asia":
      return `Your education savings will lose $${lostValue.toFixed(
        0
      )} in purchasing power, potentially affecting your ability to pay for extra classes.`;
    default:
      return `Inflation will reduce your education fund by $${lostValue.toFixed(
        0
      )} this year.`;
  }
}

// Region-specific remittance scenarios
function getRemittanceScenario(region: Region, lostValue: number): string {
  switch (region) {
    case "Africa":
      return `When sending money to family, inflation could reduce the value by $${lostValue.toFixed(
        0
      )} yearly, affecting their ability to buy essentials.`;
    case "USA":
      return `Money sent to relatives abroad will lose $${lostValue.toFixed(
        0
      )} in value due to inflation, reducing their purchasing power.`;
    case "Europe":
      return `Your family support payments will lose $${lostValue.toFixed(
        0
      )} in value, potentially affecting your relatives' quality of life.`;
    case "LatAm":
      return `Money sent to family members could lose $${lostValue.toFixed(
        0
      )} in purchasing power, making it harder for them to cover basic needs.`;
    case "Asia":
      return `Your remittances will lose $${lostValue.toFixed(
        0
      )} in value due to inflation, potentially reducing the support you can provide to family.`;
    default:
      return `Inflation will reduce your remittances by $${lostValue.toFixed(
        0
      )} this year.`;
  }
}

// Region-specific business scenarios
function getBusinessScenario(region: Region, lostValue: number): string {
  switch (region) {
    case "Africa":
      return `Your small business inventory budget will lose $${lostValue.toFixed(
        0
      )} in purchasing power, potentially reducing your stock levels.`;
    case "USA":
      return `Your business operating funds will lose $${lostValue.toFixed(
        0
      )} to inflation, potentially affecting your ability to invest in growth.`;
    case "Europe":
      return `Your business reserves will lose $${lostValue.toFixed(
        0
      )} in value, which could impact your ability to handle unexpected expenses.`;
    case "LatAm":
      return `High inflation could reduce your business capital by $${lostValue.toFixed(
        0
      )}, making it harder to maintain inventory levels.`;
    case "Asia":
      return `Your business savings will lose $${lostValue.toFixed(
        0
      )} in purchasing power, potentially affecting your ability to pay suppliers.`;
    default:
      return `Inflation will reduce your business funds by $${lostValue.toFixed(
        0
      )} this year.`;
  }
}

// Region-specific travel scenarios
function getTravelScenario(region: Region, lostValue: number): string {
  switch (region) {
    case "Africa":
      return `Your travel budget will lose $${lostValue.toFixed(
        0
      )} in value, potentially limiting your ability to visit family abroad.`;
    case "USA":
      return `Your vacation fund will lose $${lostValue.toFixed(
        0
      )} to inflation, which could mean fewer days traveling or less comfortable accommodations.`;
    case "Europe":
      return `Your holiday savings will lose $${lostValue.toFixed(
        0
      )} in value, potentially affecting your travel plans or destination choices.`;
    case "LatAm":
      return `Inflation could reduce your travel budget by $${lostValue.toFixed(
        0
      )}, making international trips more expensive.`;
    case "Asia":
      return `Your travel savings will lose $${lostValue.toFixed(
        0
      )} in purchasing power, potentially limiting your ability to explore new places.`;
    default:
      return `Inflation will reduce your travel budget by $${lostValue.toFixed(
        0
      )} this year.`;
  }
}

// Region-specific savings scenarios
function getSavingsScenario(region: Region, lostValue: number): string {
  switch (region) {
    case "Africa":
      return `Your emergency savings will lose $${lostValue.toFixed(
        0
      )} in purchasing power, reducing your financial safety net.`;
    case "USA":
      return `Your savings account will lose $${lostValue.toFixed(
        0
      )} to inflation this year, silently eroding your financial security.`;
    case "Europe":
      return `Your savings will lose $${lostValue.toFixed(
        0
      )} in value, which means less money for future needs or opportunities.`;
    case "LatAm":
      return `High inflation could reduce your savings by $${lostValue.toFixed(
        0
      )}, making it harder to achieve your financial goals.`;
    case "Asia":
      return `Your savings will lose $${lostValue.toFixed(
        0
      )} in purchasing power, potentially affecting your long-term financial plans.`;
    default:
      return `Inflation will reduce your savings by $${lostValue.toFixed(
        0
      )} this year.`;
  }
}
