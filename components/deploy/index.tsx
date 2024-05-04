'use client'

import ClientConfiguration from './client-configuration'
import RealmSettings from './realm-settings'
import TokenLifespans from './token-lifespans'
import JSONPretty from 'react-json-pretty'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { DownloadIcon } from '@radix-ui/react-icons'
import { useKeycloakConfigurationContext } from '../../context/keycloak-config'
import { useState } from 'react'
import { Button } from '../ui/button'

export default function ConfigPage() {
  const { config } = useKeycloakConfigurationContext()
  const [showConfig, setShowConfig] = useState<boolean>(false)

  return (
    <div className='container mx-auto py-10 overflow-x-hidden'>
      <h1 className='text-3xl font-bold mb-10'>
        Welcome to Keycloak Admin Console
      </h1>

      <div className='grid grid-cols-3 gap-x-4 gap-y-10'>
        <div className='col-span-1'>
          <h2 className='text-2xl font-bold mb-5'>Realm Settings</h2>
          <RealmSettings />
        </div>

        {/* <div className='col-span-2'>
          <h2 className='text-2xl font-bold mb-5'>Token Lifespans</h2>
          <TokenLifespans />
        </div> */}

        <div className='col-span-3'>
          <h2 className='text-2xl font-bold mb-5'>Client Configuration</h2>
          <ClientConfiguration />
        </div>
      </div>

      <div className='w-full mt-10'>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className='w-full flex items-center justify-between'>
                Generated Configuration
                <a
                  title='Download Configuration'
                  className='p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded'
                  href={
                    'data:text/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify(config, null, 2))
                  }
                  download='keycloak-config.json'
                >
                  <DownloadIcon className='h-6 w-6 text-gray-500' />
                </a>
              </div>
            </CardTitle>
            <CardDescription>
              This is the configuration that will be generated based on your
              inputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowConfig(!showConfig)}
              variant='outline'
              className='mb-5'
            >
              {showConfig ? 'Hide Configuration' : 'Show Configuration'}
            </Button>
            {showConfig && <JSONPretty data={config} />}
          </CardContent>
          <CardFooter>
            <p>
              <a href='https://www.keycloak.org/' className='font-semibold'>
                Keycloak
              </a>{' '}
              is an open source Identity and Access Management solution aimed at
              modern applications and services. It makes it easy to secure
              applications and services with little to no code.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
