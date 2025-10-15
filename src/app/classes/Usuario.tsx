import { auth, database } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { ref, update } from "firebase/database";

export class Usuario {
  nome: string;
  email: string;
  senha: string;

  constructor(nome: string, email: string, senha: string) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
  }

  async cadastrar(): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.senha);
      const userId = userCredential.user.uid;

      await update(ref(database, `contas/${userId}`), {
        idconta: userId,
        nomeUsuario: this.nome,
        emailUsuario: this.email,
      });

    } catch (error) {
      console.error(error);
      throw new Error("Erro ao cadastrar o usuário. Tente novamente mais tarde.");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async login(): Promise<any> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.senha);
      const user = userCredential.user;
      return user;
      
    } catch (error) {
      let erroMessage = "Erro desconhecido. Tente novamente.";
      if (error instanceof Error && "code" in error) {
        switch (error.code) {
          case "auth/internal-error":
            erroMessage = "Ocorreu um erro interno. Tente novamente mais tarde.";
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
            erroMessage = "Este usuário não está cadastrado ou a senha está incorreta.";
            break;
          default:
            erroMessage = "Ocorreu um erro ao tentar fazer login.";
            break;
        }
      }
      throw new Error(erroMessage);
    }
  }

  async atualizarUsuario(currentUserId: string, newNome: string, newEmail: string, newSenha: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error("Usuário não está autenticado.");
      }

      // Atualizar a senha no Firebase Authentication
      if (newSenha && newSenha.length >= 6) {
        try {
          await updatePassword(auth.currentUser, newSenha);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          if (error.code === "auth/requires-recent-login") {
            throw new Error("Por favor, faça login novamente para atualizar a senha.");
          } else if (error.code === "auth/weak-password") {
            throw new Error("A senha deve ter pelo menos 6 caracteres.");
          }
          throw error;
        }
      }

      // Atualizar dados no Firebase Realtime Database
      await update(ref(database, `contas/${currentUserId}`), {
        idconta: currentUserId,
        nomeUsuario: newNome,
        emailUsuario: newEmail,
      });

      // Atualização local dos dados do usuário
      this.nome = newNome;
      this.email = newEmail;
      if (newSenha) {
        this.senha = newSenha;
      }

     
    } catch (error) {
      console.error(error);
      let errorMessage = "Erro ao atualizar os dados do usuário. Tente novamente mais tarde.";
      if (error instanceof Error && "message" in error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }
}