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
    FiBarChart2
} from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { FormSettings } from '@/types/form'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar } from '@nivo/bar'
import { Question } from '@/types/form'
interface FormAnalytics {
    totalResponses: number;
    responsesByDate: { [date: string]: number };
    questions: {
        [questionId: string]: QuestionAnalytics;
    };
    averageCompletionTime: number;
    completionRate: number;
    lastResponseDate?: string;
}

interface QuestionAnalytics {
    totalResponses: number;
    options: { [optionId: string]: number };
    skipped: number;
}

interface FormSidebarProps {
    settings: FormSettings
    analytics?: FormAnalytics
    questions: Question[]
    onSettingsChange: (settings: FormSettings) => void
    saving?: boolean
}

const ResponseSettings = memo(({ settings, handleSettingChange, saving }: any) => (
    <div className="space-y-4">
        <h3 className="font-medium">Cài đặt phản hồi</h3>
        <div className="space-y-4">
            {[{
                label: "Thu thập địa chỉ email",
                description: "Yêu cầu người dùng đăng nhập",
                key: "collectEmail"
            }, {
                label: "Giới hạn 1 phản hồi",
                description: "Yêu cầu người dùng đăng nhập",
                key: "limitOneResponsePerUser"
            }, {
                label: "Hiển thị thanh tiến trình",
                description: "Hiển thị tiến trình qua từng phần",
                key: "showProgressBar"
            }, {
                label: "Xáo trộn thứ tự câu hỏi",
                description: "Câu hỏi sẽ xuất hiện theo thứ tự ngẫu nhiên",
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
ResponseSettings.displayName = 'ResponseSettings'

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
ThemeSettings.displayName = 'ThemeSettings'
// const PreviewTab = memo(() => (
//     <div className="space-y-4">
//         <h3 className="font-medium">Form Preview</h3>
//         <div className="aspect-[9/16] rounded-lg border bg-gray-50 flex items-center justify-center">
//             Preview will appear here
//         </div>
//     </div>
// ))

const ResponseStats = memo(({ analytics, questions }: { analytics?: FormAnalytics, questions: Question[] }) => {
    const formatAverageTime = (minutes: number) => {
        if (minutes < 1) return 'Less than 1 min';
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const formatLastResponse = (date?: string) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Chuyển đổi dữ liệu cho biểu đồ
    const chartData = analytics?.responsesByDate ? [
        {
            id: "responses",
            data: Object.entries(analytics.responsesByDate)
                .slice(-7) // 7 ngày gần nhất
                .map(([date, value]) => ({
                    x: new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    }),
                    y: value
                }))
        }
    ] : [];

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Response Statistics</h3>

            <div className="rounded-lg border bg-gray-50 p-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Responses</span>
                        <span className="font-medium">{analytics?.totalResponses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Time</span>
                        <span className="font-medium">
                            {analytics?.averageCompletionTime
                                ? formatAverageTime(analytics.averageCompletionTime)
                                : '0 min'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Response</span>
                        <span className="font-medium">
                            {formatLastResponse(analytics?.lastResponseDate)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium">Responses over time</h4>
                <div className="aspect-[16/9] rounded-lg border bg-gray-50 p-4">
                    {analytics?.responsesByDate ? (
                        <ResponsiveLine
                            data={chartData}
                            margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                            xScale={{
                                type: 'point'
                            }}
                            yScale={{
                                type: 'linear',
                                min: 0,
                                max: 'auto'
                            }}
                            curve="monotoneX"
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: -45
                            }}
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0
                            }}
                            enablePoints={true}
                            pointSize={8}
                            pointColor="#ffffff"
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            enableArea={true}
                            areaOpacity={0.15}
                            enableGridX={false}
                            enableGridY={true}
                            colors={['#3b82f6']} // Tailwind blue-500
                            theme={{
                                axis: {
                                    ticks: {
                                        text: {
                                            fontSize: 11,
                                            fill: '#6b7280' // gray-500
                                        }
                                    }
                                },
                                grid: {
                                    line: {
                                        stroke: '#e5e7eb', // gray-200
                                        strokeWidth: 1
                                    }
                                },
                                crosshair: {
                                    line: {
                                        stroke: '#6b7280',
                                        strokeWidth: 1,
                                        strokeOpacity: 0.35
                                    }
                                }
                            }}
                            tooltip={({ point }) => (
                                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                                    <strong>{String(point.data.x)}</strong>: {String(point.data.y)} responses
                                </div>
                            )}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <FiBarChart2 className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {analytics?.questions && Object.entries(analytics.questions)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, qa]) => Object.keys(qa.options).length > 0)
                .map(([questionId, qa]) => {
                    // Tìm question tương ứng để lấy title và options
                    const question = questions.find(q => q.id === questionId);
                    if (!question) return null;

                    // Map options với label tương ứng
                    const barData = Object.entries(qa.options).map(([optionId, count]) => {
                        const option = question.options?.find(opt =>
                            typeof opt === 'string' ? opt === optionId : (opt as { id: string }).id === optionId
                        );
                        return {
                            option: typeof option === 'string' ? option : (option as unknown as { value: string }).value || optionId,
                            count: count
                        };
                    });

                    return (
                        <div key={questionId} className="space-y-2">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Question Responses</h4>
                                <h5 className="text-sm text-gray-500">{question.title}</h5>
                            </div>
                            <div className="h-40 rounded-lg border bg-gray-50 p-4">
                                <ResponsiveBar
                                    data={barData}
                                    keys={['count']}
                                    indexBy="option"
                                    margin={{ top: 10, right: 10, bottom: 40, left: 40 }} // Tăng bottom margin cho label dài
                                    padding={0.3}
                                    colors={['#3b82f6']}
                                    borderRadius={4}
                                    axisBottom={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: -45,
                                        truncateTickAt: 20 // Giới hạn độ dài của label
                                    }}
                                    axisLeft={{
                                        tickSize: 5,
                                        tickPadding: 5
                                    }}
                                    enableLabel={true}
                                    labelSkipWidth={12}
                                    labelSkipHeight={12}
                                    labelTextColor="#ffffff"
                                    theme={{
                                        axis: {
                                            ticks: {
                                                text: {
                                                    fontSize: 11,
                                                    fill: '#6b7280'
                                                }
                                            }
                                        },
                                        grid: {
                                            line: {
                                                stroke: '#e5e7eb',
                                                strokeWidth: 1
                                            }
                                        }
                                    }}
                                    tooltip={({ value, indexValue }) => (
                                        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                                            <strong>{indexValue}</strong>: {value} responses
                                            <div className="text-xs text-gray-500 mt-1">
                                                {Math.round((value / qa.totalResponses) * 100)}% of responses
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="text-xs text-gray-500 flex justify-between">
                                <span>Total responses: {qa.totalResponses}</span>
                                <span>Skipped: {qa.skipped}</span>
                            </div>
                        </div>
                    );
                })}

            <div className="space-y-2">
                <h4 className="text-sm font-medium">Completion Rate</h4>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${analytics?.completionRate || 0}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>{Math.round(analytics?.completionRate || 0)}% completed</span>
                    <span>{analytics?.totalResponses || 0} responses</span>
                </div>
            </div>
        </div>
    );
});
ResponseStats.displayName = 'ResponseStats'

function FormSidebarComponent({ settings, analytics, questions, onSettingsChange, saving = false }: FormSidebarProps) {
    const [isOpen, setIsOpen] = useState(true)

    const handleSettingChange = (key: keyof FormSettings, value: unknown) => {
        onSettingsChange({
            ...settings,
            [key]: value
        })
    }

    return (
        <aside
            className={cn(
                'fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-120 border-l bg-white transition-all duration-300',
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
                        <ResponseStats analytics={analytics} questions={questions} />
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
