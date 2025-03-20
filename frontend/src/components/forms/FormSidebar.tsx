'use client'

import { memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    FiChevronRight,
    FiChevronLeft,
    FiImage,
    FiBarChart2
} from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { FormSettings } from '@/types/form'

interface FormSidebarProps {
    settings: FormSettings
    onSettingsChange: (settings: FormSettings) => void
    saving?: boolean
}

const ResponseSettings = memo(({ settings, handleSettingChange, saving }: any) => (
    <div className="space-y-4">
        <h3 className="font-medium">Response Settings</h3>
        <div className="space-y-4">
            {[{
                label: "Collect email addresses",
                description: "Require respondents to sign in",
                key: "collectEmail"
            }, {
                label: "Limit to 1 response",
                description: "Requires sign in to enforce",
                key: "limitOneResponsePerUser"
            }, {
                label: "Show progress bar",
                description: "Display progress through sections",
                key: "showProgressBar"
            }, {
                label: "Shuffle question order",
                description: "Questions will appear in random order",
                key: "shuffleQuestions"
            }].map(({ label, description, key }) => (
                <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>{label}</Label>
                        <div className="text-sm text-gray-500">{description}</div>
                    </div>
                    <Switch
                        checked={settings[key]}
                        onCheckedChange={(checked) => handleSettingChange(key, checked)}
                        disabled={saving}
                    />
                </div>
            ))}
            <div className="space-y-2">
                <Label>Confirmation message</Label>
                <Input
                    defaultValue={settings.confirmationMessage}
                    onBlur={(e) => handleSettingChange('confirmationMessage', e.target.value)}
                    disabled={saving}
                />
            </div>
        </div>
    </div>
))

const ThemeSettings = memo(({ settings, handleSettingChange, saving }: any) => (
    <div className="space-y-4">
        <h3 className="font-medium">Theme Settings</h3>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Theme Color</Label>
                <Input
                    type="color"
                    defaultValue={settings.theme?.color}
                    onBlur={(e) =>
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
))

const PreviewTab = memo(() => (
    <div className="space-y-4">
        <h3 className="font-medium">Form Preview</h3>
        <div className="aspect-[9/16] rounded-lg border bg-gray-50 flex items-center justify-center">
            Preview will appear here
        </div>
    </div>
))

const ResponseStats = memo(() => (
    <div className="space-y-4">
        <h3 className="font-medium">Response Statistics</h3>

        <div className="rounded-lg border bg-gray-50 p-4">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Responses</span>
                    <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Time</span>
                    <span className="font-medium">0 min</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Response</span>
                    <span className="font-medium">Never</span>
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <h4 className="text-sm font-medium">Responses over time</h4>
            <div className="aspect-[16/9] rounded-lg border bg-gray-50 flex items-center justify-center">
                <FiBarChart2 className="h-8 w-8 text-gray-400" />
            </div>
        </div>

        <div className="space-y-2">
            <h4 className="text-sm font-medium">Completion Rate</h4>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: '0%' }}
                />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
                <span>0% completed</span>
                <span>0 responses</span>
            </div>
        </div>

        <Button variant="outline" className="w-full">
            View Detailed Analytics
        </Button>
    </div>
))

function FormSidebarComponent({ settings, onSettingsChange, saving = false }: FormSidebarProps) {
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
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="theme">Theme</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>

                <div className="overflow-auto h-[calc(100%-48px)] p-6">
                    <TabsContent value="settings" className="mt-0 space-y-6">
                        <ResponseSettings settings={settings} handleSettingChange={handleSettingChange} saving={saving} />
                    </TabsContent>
                    <TabsContent value="theme" className="mt-0">
                        <ThemeSettings settings={settings} handleSettingChange={handleSettingChange} saving={saving} />
                    </TabsContent>
                    <TabsContent value="stats" className="mt-0">
                        <ResponseStats />
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

const FormSidebar = memo(FormSidebarComponent)
export { FormSidebar }
