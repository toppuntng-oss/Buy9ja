import { Check, Package, Truck, CheckCircle2 } from "lucide-react";

interface OrderTrackingProps {
  status: "preparing" | "on-the-way" | "delivered";
  orderId: string;
  estimatedTime?: string;
}

export function OrderTracking({ status, orderId, estimatedTime }: OrderTrackingProps) {
  const steps = [
    { id: "preparing", label: "Preparing", icon: Package },
    { id: "on-the-way", label: "On the way", icon: Truck },
    { id: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === status);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-semibold mb-1">Order #{orderId}</h3>
        {estimatedTime && status !== "delivered" && (
          <p className="text-sm text-gray-600">
            Estimated delivery: {estimatedTime}
          </p>
        )}
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200">
          <div
            className="bg-green-500 transition-all duration-500"
            style={{
              height: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative space-y-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted && index < currentStepIndex ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      isCurrent ? "text-green-500" : isCompleted ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-gray-600">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
