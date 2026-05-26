import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './router'

import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { TourProvider } from './context/TourContext'
import { IconContext } from '@phosphor-icons/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <IconContext.Provider
          value={{
            color: "currentColor",
            size: "1.25em",
            weight: "duotone",
            mirrored: false,
          }}
        >
          <TourProvider>
            <RouterProvider router={router} />
          </TourProvider>
        </IconContext.Provider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)

