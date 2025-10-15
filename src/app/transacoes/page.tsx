// pages/transacoes-efetuadas.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import ExtratoCompletoComponent from "../dashboard/components/extratoCompletoComponent";
import DashboardNavbar from "../dashboard/components/dashboardnavbar";

export default function TransacoesEfetuadasPage() {
    return (
        <main>
            <DashboardNavbar />
            <div className="container mt-4">
                <ExtratoCompletoComponent />
                <Link href="/dashboard" className="btn btn-primary mt-5">
                    ← Voltar ao Dashboard
                </Link>
            </div>
        </main>

    );
}
