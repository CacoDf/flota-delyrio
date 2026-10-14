# Flota Delyrio

Panel del estado de los documentos (revisión técnica, SOAP y permiso de circulación) de los carros de arrastre de Delyrio. Es una app web que se instala en el celular.

- Los datos (`data.enc.json`) están cifrados con AES-GCM 256 y una llave derivada de la clave (PBKDF2-SHA256). Sin la clave no se pueden leer.
- Los links "Ver PDF" llevan a Google Drive y solo se abren con una cuenta que tenga permiso.
- Se actualiza desde el PC de control con `python _sistema/publicar_app.py`.
