'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import AbrirContaModal from "@/components/abrirModal";
import ModalLogin from "./modalLogin";


export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-light px-3">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" href="/"><Image src="/images/logo.png" alt="Logo Balancer" width={120} height={120} priority /></Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="d-flex align-items-center gap-3 ms-auto">
            <Link className="nav-link" href="/sobre">Sobre</Link>
            <Link className="nav-link" href="/servicos">Serviços</Link>
            <AbrirContaModal />
            <ModalLogin />
          </div>
        </div>
      </div>
    </nav>
  );
}
