'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/style.css';
import Image from 'next/image';
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AbrirContaModal from '@/components/abrirModal';

export default function HomePage() {
  return (
      <main>
        <Navbar />
        <section className="banner">
          <div className="banner-content">
            <h1>Crie sua conta!</h1>
            <p>Experimente mais liberdade no controle da sua vida financeira.</p>
            <AbrirContaModal />
          </div>
          <div className="banner-image">
            <Image src="/images/banner_balance_coin.png" className='img-fluid' alt="Ilustração sobre controle financeiro" width={750} height={750} priority />
          </div>
        </section>
          <section className="vantagens py-5">
            <div className="container">
              <h2 className="mb-3">Vantagens do nosso banco</h2>
              <div className="linha-destaque mb-4"></div>
              <div className="row g-4">
                <div className="col-lg-3 col-md-6">
                  <div className = "card h-100 d-flex flex-column">
                    <div className="card-body">
                        <Image src="/images/presente.png" alt="Conta e cartão gratuitos" width={73} height={56} className="mx-auto mb-3"/>
                      <h5 className="card-title">Conta e cartão gratuitos</h5>
                      <p className="card-text">Isso mesmo, nossa conta é digital, sem custo fixo e mais que isso: sem tarifa de manutenção.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className = "card h-100 d-flex flex-column">
                    <div className="card-body">
                      <Image src="/images/saque.png" alt="Saques sem custo" width={73} height={56} className="mx-auto mb-3"/>
                      <h5 className="card-title">Saques sem custo</h5>
                      <p className="card-text">Você pode sacar gratuitamente 4x por mês de qualquer Banco 24h.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className = "card h-100 d-flex flex-column">
                    <div className="card-body">
                      <Image src="/images/estrela.png" alt="Programa de pontos" width={73} height={56} className="mx-auto mb-3"/>
                      <h5 className="card-title">Programa de pontos</h5>
                      <p className="card-text">Você pode acumular pontos com suas compras no crédito sem pagar mensalidade!</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className = "card h-100 d-flex flex-column">
                    <div className="card-body">
                      <Image src="/images/dispositivos.png" alt="Seguro Dispositivos" width={73} height={56} className="mx-auto mb-3"/>
                      <h5 className="card-title">Seguro Dispositivos</h5>
                      <p className="card-text">Seus dispositivos móveis protegidos por uma mensalidade simbólica.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        <Footer/>
      </main>
  );
}
