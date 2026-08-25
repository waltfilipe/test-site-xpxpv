import { ReportsClient } from "./ReportsClient";
import { ReportsFootnote } from "./ReportsFootnote";

export const metadata = {
  title: "Reports | xP & xPV Analysis",
  description: "Midfielder PDF reports with pass grades, pillar letters and pass maps",
};

export default function ReportsPage() {
  return (
    <div className="container reports-container">
      <ReportsClient />
      <ReportsFootnote />
    </div>
  );
}
