import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.2);
  const [interestRate, setInterestRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    const principal = propertyPrice - downPayment;
    if (principal <= 0) {
      setMonthlyPayment(0);
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = years * 12;

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    setMonthlyPayment(Math.round(payment));
  }, [propertyPrice, downPayment, interestRate, years]);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Mortgage Estimator</h4>

      <div className="space-y-3">
        <div>
          <Label htmlFor="down-payment" className="text-sm">
            Down Payment (₹)
          </Label>
          <Input
            id="down-payment"
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="interest-rate" className="text-sm">
              Rate (%)
            </Label>
            <Input
              id="interest-rate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              step="0.1"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="years" className="text-sm">
              Years
            </Label>
            <Input
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center">
        <p className="text-sm opacity-80">Est. Monthly Payment</p>
        <p className="text-xl font-bold">{formatPrice(monthlyPayment)} / mo</p>
      </div>
    </div>
  );
}
