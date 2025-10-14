'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/footer.css';
import Image from 'next/image';

import React from 'react';

export default function Footer() {
  return (
    <footer>
    <div className="container">
      <div className="row">
        <div className="col-md-4">
          <h5>Serviços</h5>
          <ul className="list-unstyled">
            <li>Conta corrente</li>
            <li>Conta PJ</li>
            <li>Cartão de crédito</li>
          </ul>
        </div>
        
        <div className="col-md-4">
          <h5>Contato</h5>
          <ul className="list-unstyled">
            <li>4002 8922</li>
            <li>meajuda@balanceCoin.com.br</li>
            <li>ouvidoria@balanceCoin.com.br</li>
          </ul>
        </div>
        
        <div className="col-md-4">
          <Image src="/images/logo.png" alt="Balance Coin Logo" className="mb-3" width={100} height={100} />
          <div className="d-flex gap-3">
            <a href="#"><Image src="/icons/instagram.svg" alt="Instagram" width={24} height={24} /></a>
            <a href="#"><Image src="/icons/whatsapp.svg" alt="WhatsApp" width={24} height={24} /></a>
            <a href="#"><Image src="/icons/youtube.svg" alt="YouTube" width={24} height={24} /></a>
          </div>
        </div>
      </div>
    </div>
</footer>
  );
}
