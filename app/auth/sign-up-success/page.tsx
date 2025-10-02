import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
      <div className="w-full max-w-md">
        <Card className="border-green-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-green-900">¡Cuenta Creada!</CardTitle>
            <CardDescription>Revisa tu correo para confirmar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada y haz clic en el
                  enlace para activar tu cuenta.
                </p>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Una vez confirmado, podrás iniciar sesión y completar tu perfil.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
