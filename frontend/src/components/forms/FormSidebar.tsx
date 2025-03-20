'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    FiSettings,
    FiEye,
    FiLink2,
    FiUsers,
    FiImage,
    FiChevronRight,
    FiChevronLeft,
} from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { FormSettings } from '@/app/api/drive'

interface FormSidebarProps {
    formId: string
    settings: FormSettings
    onSettingsChange: (settings: FormSettings) => Promise<void>
    saving?: boolean
}

export function FormSidebar({
    formId,
    settings,
    onSettingsChange,
    saving = false
}: FormSidebarProps) {
    const [isOpen, setIsOpen] = useState(true)

    const handleSettingChange = (key: keyof FormSettings, value: any) => {
        onSettingsChange({
            ...settings,
            [key]: value
        })
    }

    return (
        <aside
            className={cn(
                'fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 border-l bg-white transition-all duration-300',
                !isOpen && 'translate-x-full'
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="absolute -left-12 top-4 rounded-full bg-white shadow-md"
                onClick={() => setIsOpen(!isOpen)}
                disabled={saving}
            >
                {isOpen ? <FiChevronRight /> : <FiChevronLeft />}
            </Button>

            <Tabs defaultValue="settings" className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="theme">Theme</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <div className="overflow-auto h-[calc(100%-48px)] p-6">
                    <TabsContent value="settings" className="mt-0 space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Response Settings</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Collect email addresses</Label>
                                        <div className="text-sm text-gray-500">
                                            Require respondents to sign in
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings.collectEmail}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange('collectEmail', checked)
                                        }
                                        disabled={saving}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Limit to 1 response</Label>
                                        <div className="text-sm text-gray-500">
                                            Requires sign in to enforce
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings.limitToOneResponse}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange('limitToOneResponse', checked)
                                        }
                                        disabled={saving}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Show progress bar</Label>
                                        <div className="text-sm text-gray-500">
                                            Display progress through sections
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings.showProgressBar}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange('showProgressBar', checked)
                                        }
                                        disabled={saving}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Shuffle question order</Label>
                                        <div className="text-sm text-gray-500">
                                            Questions will appear in random order
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings.shuffleQuestions}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange('shuffleQuestions', checked)
                                        }
                                        disabled={saving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Confirmation message</Label>
                                    <Input
                                        value={settings.confirmationMessage}
                                        onChange={(e) =>
                                            handleSettingChange('confirmationMessage', e.target.value)
                                        }
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium">Theme Settings</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Theme Color</Label>
                                    <Input
                                        type="color"
                                        value={settings.theme?.color}
                                        onChange={(e) =>
                                            handleSettingChange('theme', {
                                                ...settings.theme,
                                                color: e.target.value
                                            })
                                        }
                                        disabled={saving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Font</Label>
                                    <select
                                        value={settings.theme?.font}
                                        onChange={(e) =>
                                            handleSettingChange('theme', {
                                                ...settings.theme,
                                                font: e.target.value
                                            })
                                        }
                                        className="w-full rounded-md border p-2"
                                        disabled={saving}
                                    >
                                        <option value="Default">Default</option>
                                        <option value="Arial">Arial</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="theme" className="p-4 space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Customize Theme</h3>

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="h-20 flex-col gap-2">
                                    <FiImage className="h-5 w-5" />
                                    <span>Header Image</span>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="preview" className="p-4">
                        <div className="space-y-4">
                            <h3 className="font-medium">Form Preview</h3>
                            <div className="aspect-[9/16] rounded-lg border bg-gray-50 flex items-center justify-center">
                                Preview will appear here
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {saving && (
                <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                    Saving...
                </div>
            )}
        </aside>
    )
} 