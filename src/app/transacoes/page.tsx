// pages/transacoes-efetuadas.tsx

import Link from "next/link";
import ExtratoCompletoComponent from "../dashboard/components/extratoCompletoComponent";
import DashboardNavbar from "../dashboard/components/dashboardnavbar";

export default function TransacoesEfetuadasPage() {
    return (
        <main>
            <DashboardNavbar />
            <div className="container mt-4">
                <ExtratoCompletoComponent />
                <Link href="/dashboard" className="btn btn-outline-primary">
                    ← Voltar ao Dashboard
                </Link>
            </div>
        </main>

    );
}
