import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PeriodeTab from "./PeriodeTab";
import DesaDetailTab from "./DesaDetailTab";

export default function DesaPSN() {
  const [selectedPeriode, setSelectedPeriode] = useState(null);

  return (
    <DashboardLayout activeMenu="Desa PSN">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        {selectedPeriode === null ? (
          <PeriodeTab onSelectPeriode={(periode) => setSelectedPeriode(periode)} />
        ) : (
          <DesaDetailTab
            periode={selectedPeriode}
            onBack={() => setSelectedPeriode(null)}
          />
        )}
      </main>
    </DashboardLayout>
  );
}
