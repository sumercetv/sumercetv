'use client';
import { useActionState } from 'react';
import { login } from './actions';
export function LoginForm({enabled}:{enabled:boolean}){
  const [state,action,busy]=useActionState(login,{error:''});
  return <form action={action}><div className="field"><label htmlFor="login-email">Correo de administrador</label><input type="email" autoComplete="username" id="login-email" name="email" required disabled={!enabled}/></div><div className="field"><label htmlFor="login-password">Contraseña</label><input type="password" autoComplete="current-password" id="login-password" name="password" minLength={8} required disabled={!enabled}/></div>{state.error&&<p className="notice" role="alert">{state.error}</p>}<button className="button button-yellow" disabled={!enabled||busy}>{busy?'Comprobando acceso…':'Iniciar sesión'}</button></form>;
}
