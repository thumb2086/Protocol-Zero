import React, { useEffect, useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useWeaponStore, WeaponType } from '../store'

// Explicitly configure Monaco to use local package
loader.config({ monaco })

const PROTOCOL_TEMPLATES: Record<WeaponType, object> = {
  classic: {
    protocol_version: "1.0",
    weapon_id: "classic_pistol_001",
    metadata: {
      name: "Classic Pistol",
      author: "System",
      created_at: new Date().toISOString()
    },
    parts: {
      frame: { type: "pistol_frame", material: "polymer" },
      slide: { type: "pistol_slide", material: "steel" },
      barrel: { type: "pistol_barrel", length: 0.8 },
      magazine: { type: "pistol_mag", capacity: 12 }
    }
  },
  vandal: {
    protocol_version: "1.0",
    weapon_id: "vandal_rifle_001",
    metadata: {
      name: "Vandal Assault Rifle",
      author: "System",
      created_at: new Date().toISOString()
    },
    parts: {
      receiver: { type: "rifle_receiver", material: "aluminum" },
      barrel: { type: "rifle_barrel", length: 1.2, rifling: "1:7" },
      handguard: { type: "rail_system", length: 1.0 },
      magazine: { type: "rifle_mag", capacity: 30 },
      stock: { type: "adjustable_stock" },
      optic: { type: "red_dot_sight" }
    }
  },
  phantom: {
    protocol_version: "1.0",
    weapon_id: "phantom_rifle_001",
    metadata: {
      name: "Phantom Silenced Rifle",
      author: "System",
      created_at: new Date().toISOString()
    },
    parts: {
      receiver: { type: "rifle_receiver", material: "aluminum" },
      silencer: { type: "integrated_suppressor", length: 0.8 },
      barrel: { type: "rifle_barrel", length: 1.0 },
      handguard: { type: "integrated_handguard" },
      magazine: { type: "rifle_mag", capacity: 25 },
      stock: { type: "fixed_stock" }
    }
  }
}

const Editor: React.FC = () => {
  const { weaponType } = useWeaponStore()
  const [code, setCode] = useState('')

  useEffect(() => {
    const template = PROTOCOL_TEMPLATES[weaponType]
    setCode(JSON.stringify(template, null, 2))
  }, [weaponType])

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="json"
      value={code}
      onChange={(value) => setCode(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 12,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        readOnly: false,
        wordWrap: 'on'
      }}
    />
  )
}

export default Editor
