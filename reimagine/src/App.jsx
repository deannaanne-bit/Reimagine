import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, FolderPlus, Calendar, DollarSign, Hammer, Palette, Users, Download, Upload, Building2, ClipboardList, ImagePlus, Ruler, Save } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Textarea } from './components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectNative } from './components/ui/select'
import { Badge } from './components/ui/badge'

function uid(){ return Math.random().toString(36).slice(2,10) }
const currency = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n||0))

const presetRooms = ['Kitchen','Bath','Primary Suite','Living Room','Dining Room','Mudroom','Laundry','Basement','Garage','Deck/Patio']
const phases = ['Scope & Vision','Design','Bids','Permits','Demo','Rough-in','Finishes','Punchlist','Complete']

// Persist
const usePersist = (key, initial) => {
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : initial
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)) }, [key, state])
  return [state, setState]
}

export default function App(){
  const [projects, setProjects] = usePersist('rp.projects', [])
  const [activeId, setActiveId] = usePersist('rp.activeId', '')
  const active = useMemo(() => projects.find(p => p.id === activeId) || null, [projects, activeId])

  function addProject(){
    const p = { id: uid(), name: `Project ${projects.length + 1}`, address:'', rooms:[], notes:'',
      budget:{ items:[], taxRate:0, contingencyPct:10 }, timeline:[], materials:[], vendors:[], mood:[],
      roi:{ estValueIncrease:0, projectCost:0 }, status:'Scope & Vision' }
    const next = [...projects, p]
    setProjects(next); setActiveId(p.id)
  }
  function updateActive(updater){
    if(!active) return
    const next = projects.map(p => p.id === active.id ? updater({ ...p }) : p)
    setProjects(next)
  }
  function removeProject(id){
    const next = projects.filter(p => p.id !== id)
    setProjects(next)
    if (activeId === id) setActiveId(next[0]?.id || '')
  }

  function exportData(){
    const blob = new Blob([JSON.stringify({ projects, activeId }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `reimagine-${new Date().toISOString().slice(0,10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }
  function importData(e){
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (parsed?.projects) setProjects(parsed.projects)
        if (parsed?.activeId) setActiveId(parsed.activeId)
      } catch { alert('Invalid file') }
    }
    reader.readAsText(file)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900'>
      <div className='max-w-7xl mx-auto p-6'>
        <header className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <Building2 className='w-8 h-8'/>
            <div>
              <h1 className='text-2xl font-semibold'>Reimagine</h1>
              <p className='text-sm text-slate-600'>Plan scope, budget, timeline, materials, and ROI for home projects.</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button onClick={addProject} className='rounded-2xl'><FolderPlus className='mr-2 w-4 h-4'/>New Project</Button>
            <Button variant='outline' onClick={exportData} className='rounded-2xl'><Download className='mr-2 w-4 h-4'/>Export</Button>
            <label className='inline-flex items-center'>
              <input type='file' accept='application/json' className='hidden' onChange={importData} />
              <span className='inline-flex items-center px-3 py-2 border rounded-2xl cursor-pointer text-sm'><Upload className='mr-2 w-4 h-4'/>Import</span>
            </label>
          </div>
        </header>

        <div className='grid md:grid-cols-[260px_1fr] gap-6 mt-6'>
          <aside className='space-y-3'>
            <Card className='shadow-sm'>
              <CardHeader className='pb-2'><CardTitle className='text-base'>Projects</CardTitle></CardHeader>
              <CardContent className='space-y-2'>
                {projects.length===0 && <p className='text-sm text-slate-500'>No projects yet. Click <b>New Project</b> to get started.</p>}
                {projects.map(p => (
                  <div key={p.id} className={`group flex items-center justify-between p-2 rounded-xl border ${p.id===activeId?'bg-slate-50 border-slate-300':'border-slate-200'}`}>
                    <button onClick={()=>setActiveId(p.id)} className='text-left'>
                      <div className='text-sm font-medium truncate max-w-[140px]'>{p.name}</div>
                      <div className='text-xs text-slate-500 truncate max-w-[140px]'>{p.address || 'No address'}</div>
                    </button>
                    <Button size='icon' variant='ghost' onClick={()=>removeProject(p.id)} className='opacity-0 group-hover:opacity-100'><Trash2 className='w-4 h-4'/></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {active && (
              <Card className='shadow-sm'>
                <CardHeader className='pb-2'><CardTitle className='text-base'>Quick Status</CardTitle></CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <Label className='text-xs'>Phase</Label>
                      <Select value={active.status} onValueChange={(v)=>updateActive(p=>{p.status=v; return p;})}>
                        <SelectTrigger className='h-9 rounded-xl'><SelectValue placeholder='Phase' /></SelectTrigger>
                        <SelectContent>
                          {phases.map(ph => <SelectItem key={ph} value={ph}>{ph}</SelectItem>)}
                        </SelectContent>
                        <SelectNative options={phases.map(ph=>({value:ph,label:ph}))} />
                      </Select>
                    </div>
                    <div>
                      <Label className='text-xs'>Contingency</Label>
                      <div className='flex items-center gap-2'>
                        <Input type='number' className='h-9 rounded-xl' value={active.budget.contingencyPct}
                          onChange={(e)=>updateActive(p=>{p.budget.contingencyPct=Number(e.target.value||0); return p;})} />
                        <span className='text-sm'>%</span>
                      </div>
                    </div>
                  </div>
                  <p className='text-xs text-slate-500'>Use tabs to add rooms, line-items, tasks, and materials. Totals update automatically.</p>
                </CardContent>
              </Card>
            )}
          </aside>

          <main>
            {!active ? (
              <EmptyState />
            ) : (
              <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}}>
                <ProjectHeader active={active} updateActive={updateActive} />

                <Tabs defaultValue='planner' className='mt-4'>
                  <TabsList className='flex flex-wrap gap-2 p-1 rounded-2xl bg-slate-100'>
                    <TabsTrigger value='planner' className='rounded-xl'><ClipboardList className='mr-2 w-4 h-4'/>Planner</TabsTrigger>
                    <TabsTrigger value='budget' className='rounded-xl'><DollarSign className='mr-2 w-4 h-4'/>Budget</TabsTrigger>
                    <TabsTrigger value='timeline' className='rounded-xl'><Calendar className='mr-2 w-4 h-4'/>Timeline</TabsTrigger>
                    <TabsTrigger value='materials' className='rounded-xl'><Hammer className='mr-2 w-4 h-4'/>Materials</TabsTrigger>
                    <TabsTrigger value='mood' className='rounded-xl'><Palette className='mr-2 w-4 h-4'/>Moodboard</TabsTrigger>
                    <TabsTrigger value='vendors' className='rounded-xl'><Users className='mr-2 w-4 h-4'/>Vendors</TabsTrigger>
                    <TabsTrigger value='roi' className='rounded-xl'><Ruler className='mr-2 w-4 h-4'/>ROI</TabsTrigger>
                  </TabsList>

                  <TabsContent value='planner'><PlannerTab active={active} updateActive={updateActive} /></TabsContent>
                  <TabsContent value='budget'><BudgetTab active={active} updateActive={updateActive} /></TabsContent>
                  <TabsContent value='timeline'><TimelineTab active={active} updateActive={updateActive} /></TabsContent>
                  <TabsContent value='materials'><MaterialsTab active={active} updateActive={updateActive} /></TabsContent>
                  <TabsContent value='mood'><MoodTab active={active} updateActive={updateActive} /></TabsContent>
                  <TabsContent value='vendors'><VendorsTab active={active} updateActive={updateActive} /></TabsContent>
                  <TabsContent value='roi'><ROITab active={active} updateActive={updateActive} /></TabsContent>
                </Tabs>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function EmptyState(){
  return (
    <Card className='shadow-sm'>
      <CardContent className='py-12 flex flex-col items-center gap-3'>
        <Building2 className='w-12 h-12'/>
        <h2 className='text-xl font-semibold'>Start your first remodel</h2>
        <p className='text-sm text-slate-600 max-w-prose text-center'>Create a project, add rooms (Kitchen, Bath, etc.), list scope items, build your budget, and map a simple timeline. Everything saves to your browser automatically.</p>
      </CardContent>
    </Card>
  )
}

function ProjectHeader({active, updateActive}){
  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-3'><CardTitle className='text-lg'>Project Overview</CardTitle></CardHeader>
      <CardContent className='grid md:grid-cols-3 gap-3'>
        <div>
          <Label className='text-xs'>Project Name</Label>
          <Input className='rounded-xl' value={active.name} onChange={(e)=>updateActive(p=>{p.name=e.target.value; return p;})} />
        </div>
        <div>
          <Label className='text-xs'>Address</Label>
          <Input className='rounded-xl' placeholder='123 Lakeview Rd, Wolfeboro, NH' value={active.address}
                 onChange={(e)=>updateActive(p=>{p.address=e.target.value; return p;})} />
        </div>
        <div>
          <Label className='text-xs'>Notes</Label>
          <Input className='rounded-xl' placeholder='E.g., white oak floors, pale-blue walls, gold accents' value={active.notes}
                 onChange={(e)=>updateActive(p=>{p.notes=e.target.value; return p;})} />
        </div>
      </CardContent>
    </Card>
  )
}

function PlannerTab({active, updateActive}){
  const [newRoom, setNewRoom] = useState('')
  const [scopeText, setScopeText] = useState('')

  function addRoom(name){
    if(!name) return
    updateActive(p=>{ p.rooms.push({ id: uid(), name, scope: [] }); return p; })
    setNewRoom('')
  }
  function addScope(roomId){
    if(!scopeText.trim()) return
    updateActive(p=>{
      const r = p.rooms.find(r=>r.id===roomId)
      r.scope.push({ id: uid(), text: scopeText.trim(), done:false })
      return p
    })
    setScopeText('')
  }
  function toggleScope(roomId, itemId){
    updateActive(p=>{ const r=p.rooms.find(r=>r.id===roomId); const it=r.scope.find(s=>s.id===itemId); it.done=!it.done; return p; })
  }
  function removeScope(roomId, itemId){
    updateActive(p=>{ const r=p.rooms.find(r=>r.id===roomId); r.scope = r.scope.filter(s=>s.id!==itemId); return p; })
  }

  return (
    <div className='grid lg:grid-cols-3 gap-4'>
      <Card className='lg:col-span-1 shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Rooms</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex gap-2'>
            <Input placeholder='Add custom room' value={newRoom} onChange={(e)=>setNewRoom(e.target.value)} className='rounded-xl'/>
            <Button onClick={()=>addRoom(newRoom)} className='rounded-xl'><Plus className='w-4 h-4 mr-1'/>Add</Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {presetRooms.map(r => <Button key={r} variant='outline' className='rounded-xl' onClick={()=>addRoom(r)}>{r}</Button>)}
          </div>
          <p className='text-xs text-slate-500'>Tip: Use rooms to organize scope, materials, and budget lines.</p>
        </CardContent>
      </Card>

      <div className='lg:col-span-2 space-y-4'>
        {active.rooms.length===0 && <Card className='shadow-sm'><CardContent className='py-10 text-center text-sm text-slate-500'>No rooms yet — add one on the left.</CardContent></Card>}
        {active.rooms.map(room => (
          <Card key={room.id} className='shadow-sm'>
            <CardHeader className='pb-2 flex flex-row items-center justify-between'>
              <CardTitle className='text-base flex items-center gap-2'><Hammer className='w-4 h-4'/>{room.name}</CardTitle>
              <Badge variant='secondary'>{room.scope.filter(s=>s.done).length}/{room.scope.length} complete</Badge>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Input placeholder={`Add a task for ${room.name}`} value={scopeText} onChange={(e)=>setScopeText(e.target.value)} className='rounded-xl'/>
                <Button onClick={()=>addScope(room.id)} className='rounded-xl'><Plus className='w-4 h-4 mr-1'/>Task</Button>
              </div>
              <ul className='space-y-2'>
                {room.scope.map(item => (
                  <li key={item.id} className='flex items-center justify-between p-2 rounded-xl border border-slate-200'>
                    <label className='flex items-center gap-2'>
                      <input type='checkbox' className='accent-slate-700' checked={item.done} onChange={()=>toggleScope(room.id,item.id)} />
                      <span className={item.done?'line-through text-slate-400':''}>{item.text}</span>
                    </label>
                    <Button size='icon' variant='ghost' onClick={()=>removeScope(room.id,item.id)}><Trash2 className='w-4 h-4'/></Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BudgetTab({active, updateActive}){
  const [line, setLine] = useState({ roomId:'', category:'', desc:'', qty:1, unitCost:0 })
  const rooms = [{id:'', name:'Unassigned'}, ...active.rooms]

  function addItem(){
    if(!line.desc) return
    updateActive(p=>{ p.budget.items.push({ id:uid(), ...line, qty:Number(line.qty||1), unitCost:Number(line.unitCost||0) }); return p; })
    setLine({ roomId:'', category:'', desc:'', qty:1, unitCost:0 })
  }
  function removeItem(id){ updateActive(p=>{ p.budget.items = p.budget.items.filter(i=>i.id!==id); return p; }) }

  const subtotal = active.budget.items.reduce((s,i)=> s + (i.qty*i.unitCost), 0)
  const tax = subtotal * (Number(active.budget.taxRate||0)/100)
  const contingency = subtotal * (Number(active.budget.contingencyPct||0)/100)
  const total = subtotal + tax + contingency

  return (
    <div className='grid xl:grid-cols-[1fr_360px] gap-4'>
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Line Items</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <div className='grid md:grid-cols-6 gap-2'>
            <Select value={line.roomId} onValueChange={(v)=>setLine({...line, roomId:v})}>
              <SelectTrigger className='rounded-xl'><SelectValue placeholder='Room' /></SelectTrigger>
              <SelectContent>
                {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
              <SelectNative options={rooms.map(r=>({value:r.id,label:r.name}))} />
            </Select>
            <Input placeholder='Category (e.g., Flooring)' className='rounded-xl md:col-span-2' value={line.category} onChange={e=>setLine({...line, category:e.target.value})}/>
            <Input placeholder='Description' className='rounded-xl md:col-span-2' value={line.desc} onChange={e=>setLine({...line, desc:e.target.value})}/>
            <Input type='number' placeholder='Qty' className='rounded-xl' value={line.qty} onChange={e=>setLine({...line, qty:e.target.value})}/>
            <Input type='number' placeholder='Unit Cost' className='rounded-xl' value={line.unitCost} onChange={e=>setLine({...line, unitCost:e.target.value})}/>
            <Button onClick={addItem} className='rounded-xl md:col-span-2'><Plus className='w-4 h-4 mr-1'/>Add</Button>
          </div>

          <div className='space-y-2'>
            {active.budget.items.length===0 && <p className='text-sm text-slate-500'>No items yet.</p>}
            {active.budget.items.map(i => (
              <div key={i.id} className='grid md:grid-cols-12 gap-2 items-center border p-2 rounded-xl border-slate-200'>
                <div className='md:col-span-2 text-sm text-slate-600'>{(active.rooms.find(r=>r.id===i.roomId)?.name) || 'Unassigned'}</div>
                <div className='md:col-span-2 font-medium'>{i.category}</div>
                <div className='md:col-span-4 text-sm'>{i.desc}</div>
                <div className='md:col-span-1 text-right'>{i.qty}</div>
                <div className='md:col-span-1 text-right'>{currency(i.unitCost)}</div>
                <div className='md:col-span-1 text-right font-medium'>{currency(i.qty*i.unitCost)}</div>
                <div className='md:col-span-1 text-right'><Button size='icon' variant='ghost' onClick={()=>removeItem(i.id)}><Trash2 className='w-4 h-4'/></Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className='h-max sticky top-6 shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Summary</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <div className='grid grid-cols-2 gap-2 text-sm'>
            <div>Subtotal</div><div className='text-right font-medium'>{currency(subtotal)}</div>
            <div className='flex items-center gap-2'>Tax Rate
              <Input type='number' className='h-8 rounded-lg w-20 ml-auto text-right' value={active.budget.taxRate}
                onChange={e=>updateActive(p=>{p.budget.taxRate=Number(e.target.value||0); return p;})}/>
              <span>%</span>
            </div>
            <div className='text-right font-medium'>{currency(tax)}</div>
            <div>Contingency ({active.budget.contingencyPct}%)</div><div className='text-right font-medium'>{currency(contingency)}</div>
            <div className='col-span-2 border-t pt-2 font-semibold flex items-center justify-between'>Total <span>{currency(total)}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineTab({active, updateActive}){
  const [task, setTask] = useState({ name:'', start:'', end:'', roomId:'' })
  const rooms = [{id:'', name:'All'}, ...active.rooms]

  function add(){ if(!task.name) return; updateActive(p=>{ p.timeline.push({ id:uid(), ...task }); return p; }); setTask({ name:'', start:'', end:'', roomId:'' }) }
  function remove(id){ updateActive(p=>{ p.timeline = p.timeline.filter(t=>t.id!==id); return p; }) }

  return (
    <div className='grid lg:grid-cols-[1fr_360px] gap-4'>
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Tasks</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <div className='grid md:grid-cols-6 gap-2'>
            <Input placeholder='Task (e.g., Demo kitchen)' className='rounded-xl md:col-span-2' value={task.name} onChange={e=>setTask({...task, name:e.target.value})}/>
            <Input type='date' className='rounded-xl' value={task.start} onChange={e=>setTask({...task,start:e.target.value})}/>
            <Input type='date' className='rounded-xl' value={task.end} onChange={e=>setTask({...task,end:e.target.value})}/>
            <Select value={task.roomId} onValueChange={(v)=>setTask({...task, roomId:v})}>
              <SelectTrigger className='rounded-xl'><SelectValue placeholder='Room' /></SelectTrigger>
              <SelectContent>
                {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
              <SelectNative options={rooms.map(r=>({value:r.id,label:r.name}))} />
            </Select>
            <Button onClick={add} className='rounded-xl'><Plus className='w-4 h-4 mr-1'/>Add</Button>
          </div>
          <div className='space-y-2'>
            {active.timeline.length===0 && <p className='text-sm text-slate-500'>No tasks yet.</p>}
            {active.timeline.map(t => (
              <div key={t.id} className='p-2 border rounded-xl border-slate-200 flex items-center justify-between'>
                <div>
                  <div className='font-medium'>{t.name}</div>
                  <div className='text-xs text-slate-500'>{t.start || '?'} → {t.end || '?'} · {(active.rooms.find(r=>r.id===t.roomId)?.name) || 'All'}</div>
                </div>
                <Button size='icon' variant='ghost' onClick={()=>remove(t.id)}><Trash2 className='w-4 h-4'/></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className='h-max sticky top-6 shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Checklist</CardTitle></CardHeader>
        <CardContent className='space-y-2 text-sm'>
          {phases.map(ph => (
            <label key={ph} className='flex items-center gap-2 p-2 rounded-xl border border-slate-200'>
              <input type='checkbox' className='accent-slate-700' defaultChecked={ph==='Scope & Vision'} />
              {ph}
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function MaterialsTab({active, updateActive}){
  const [mat, setMat] = useState({ name:'', supplier:'', link:'', roomId:'', unit:'each', unitCost:0, notes:'' })
  const rooms = [{id:'', name:'Unassigned'}, ...active.rooms]

  function add(){ if(!mat.name) return; updateActive(p=>{ p.materials.push({ id:uid(), ...mat, unitCost:Number(mat.unitCost||0) }); return p; }); setMat({ name:'', supplier:'', link:'', roomId:'', unit:'each', unitCost:0, notes:'' }) }
  function remove(id){ updateActive(p=>{ p.materials = p.materials.filter(m=>m.id!==id); return p; }) }

  return (
    <div className='space-y-4'>
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Add Material / Fixture</CardTitle></CardHeader>
        <CardContent className='grid md:grid-cols-6 gap-2'>
          <Input placeholder='Name (e.g., White Oak, 5" plank)' className='rounded-xl md:col-span-2' value={mat.name} onChange={e=>setMat({...mat,name:e.target.value})}/>
          <Input placeholder="Supplier (e.g., Lowe's)" className='rounded-xl' value={mat.supplier} onChange={e=>setMat({...mat,supplier:e.target.value})}/>
          <Input placeholder='Link (optional)' className='rounded-xl md:col-span-2' value={mat.link} onChange={e=>setMat({...mat,link:e.target.value})}/>
          <Select value={mat.roomId} onValueChange={(v)=>setMat({...mat, roomId:v})}>
            <SelectTrigger className='rounded-xl'><SelectValue placeholder='Room' /></SelectTrigger>
            <SelectContent>
              {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
            <SelectNative options={rooms.map(r=>({value:r.id,label:r.name}))} />
          </Select>
          <Input placeholder='Unit (sqft, each, box)' className='rounded-xl' value={mat.unit} onChange={e=>setMat({...mat,unit:e.target.value})}/>
          <Input type='number' placeholder='Unit Cost' className='rounded-xl' value={mat.unitCost} onChange={e=>setMat({...mat,unitCost:e.target.value})}/>
          <Input placeholder='Notes' className='rounded-xl md:col-span-3' value={mat.notes} onChange={e=>setMat({...mat,notes:e.target.value})}/>
          <Button onClick={add} className='rounded-xl'><Plus className='mr-1 w-4 h-4'/>Add</Button>
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Catalog</CardTitle></CardHeader>
        <CardContent className='grid md:grid-cols-2 gap-3'>
          {active.materials.length===0 && <p className='text-sm text-slate-500'>No materials yet.</p>}
          {active.materials.map(m => (
            <div key={m.id} className='border rounded-xl p-3 border-slate-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-medium'>{m.name}</div>
                  <div className='text-xs text-slate-500'>{(active.rooms.find(r=>r.id===m.roomId)?.name)||'Unassigned'} · {m.supplier || '—'}</div>
                </div>
                <Button size='icon' variant='ghost' onClick={()=>remove(m.id)}><Trash2 className='w-4 h-4'/></Button>
              </div>
              {m.link && <a href={m.link} target='_blank' className='text-xs underline'>Open link</a>}
              <div className='text-sm mt-1'>Unit: {m.unit} · {currency(m.unitCost)}</div>
              {m.notes && <div className='text-sm text-slate-600 mt-1'>{m.notes}</div>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function MoodTab({active, updateActive}){
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [roomId, setRoomId] = useState('')
  const rooms = [{id:'', name:'All'}, ...active.rooms]

  function add(){ if(!url) return; updateActive(p=>{ p.mood.push({ id:uid(), url, caption, roomId }); return p; }); setUrl(''); setCaption(''); setRoomId(''); }
  function remove(id){ updateActive(p=>{ p.mood = p.mood.filter(m=>m.id!==id); return p; }) }

  return (
    <div className='space-y-4'>
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Add Image</CardTitle></CardHeader>
        <CardContent className='grid md:grid-cols-6 gap-2'>
          <Input placeholder='Image URL' className='rounded-xl md:col-span-3' value={url} onChange={e=>setUrl(e.target.value)} />
          <Input placeholder='Caption (optional)' className='rounded-xl md:col-span-2' value={caption} onChange={e=>setCaption(e.target.value)} />
          <Select value={roomId} onValueChange={v=>setRoomId(v)}>
            <SelectTrigger className='rounded-xl'><SelectValue placeholder='Room' /></SelectTrigger>
            <SelectContent>
              {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
            <SelectNative options={rooms.map(r=>({value:r.id,label:r.name}))} />
          </Select>
          <Button onClick={add} className='rounded-xl'><ImagePlus className='mr-2 w-4 h-4'/>Add</Button>
        </CardContent>
      </Card>

      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
        {active.mood.length===0 && <Card className='shadow-sm'><CardContent className='py-10 text-center text-sm text-slate-500'>No images yet.</CardContent></Card>}
        {active.mood.map(m => (
          <motion.div key={m.id} layout initial={{opacity:0}} animate={{opacity:1}} className='relative group'>
            <img src={m.url} alt={m.caption} className='w-full h-56 object-cover rounded-2xl shadow'/>
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition rounded-2xl'></div>
            <div className='absolute bottom-2 left-2 right-2 text-white text-sm drop-shadow'>{m.caption}</div>
            <Button size='icon' variant='secondary' className='absolute top-2 right-2 opacity-0 group-hover:opacity-100' onClick={()=>remove(m.id)}><Trash2 className='w-4 h-4'/></Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VendorsTab({active, updateActive}){
  const [v, setV] = useState({ name:'', role:'', phone:'', email:'', notes:'' })
  function add(){ if(!v.name) return; updateActive(p=>{ p.vendors.push({ id:uid(), ...v }); return p; }); setV({ name:'', role:'', phone:'', email:'', notes:'' }) }
  function remove(id){ updateActive(p=>{ p.vendors = p.vendors.filter(x=>x.id!==id); return p; }) }

  return (
    <div className='grid lg:grid-cols-2 gap-4'>
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Add Vendor / Pro</CardTitle></CardHeader>
        <CardContent className='grid md:grid-cols-2 gap-2'>
          <Input placeholder='Name' className='rounded-xl' value={v.name} onChange={e=>setV({...v,name:e.target.value})}/>
          <Input placeholder='Role (GC, Plumber, Designer)' className='rounded-xl' value={v.role} onChange={e=>setV({...v,role:e.target.value})}/>
          <Input placeholder='Phone' className='rounded-xl' value={v.phone} onChange={e=>setV({...v,phone:e.target.value})}/>
          <Input placeholder='Email' className='rounded-xl' value={v.email} onChange={e=>setV({...v,email:e.target.value})}/>
          <Textarea placeholder='Notes (licenses, bid #, insurance exp.)' className='rounded-xl md:col-span-2' value={v.notes} onChange={e=>setV({...v,notes:e.target.value})}/>
          <Button onClick={add} className='rounded-xl md:col-span-2'><Plus className='mr-2 w-4 h-4'/>Add</Button>
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='textbase'>Directory</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {active.vendors.length===0 && <p className='text-sm text-slate-500'>No vendors yet.</p>}
          {active.vendors.map(x => (
            <div key={x.id} className='p-2 border rounded-xl border-slate-200'>
              <div className='flex items-center justify-between'><div className='font-medium'>{x.name}</div><Button size='icon' variant='ghost' onClick={()=>remove(x.id)}><Trash2 className='w-4 h-4'/></Button></div>
              <div className='text-xs text-slate-500'>{x.role}</div>
              <div className='text-sm'>{x.phone} {x.email && <span>· <a className='underline' href={`mailto:${x.email}`}>{x.email}</a></span>}</div>
              {x.notes && <div className='text-sm text-slate-600 mt-1'>{x.notes}</div>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ROITab({active, updateActive}){
  const [roi, setROI] = useState(active.roi)
  useEffect(()=>{ setROI(active.roi) }, [active.id])
  const net = (Number(roi.estValueIncrease||0)) - (Number(roi.projectCost||0))
  const pct = Number(roi.projectCost) ? (net / Number(roi.projectCost)) * 100 : 0
  function save(){ updateActive(p=>{ p.roi = roi; return p; }) }
  return (
    <div className='grid md:grid-cols-2 gap-4'>
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Estimate ROI</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <div>
            <Label className='text-xs'>Projected Value Increase</Label>
            <Input type='number' className='rounded-xl' value={roi.estValueIncrease} onChange={e=>setROI({...roi, estValueIncrease:Number(e.target.value||0)})}/>
          </div>
          <div>
            <Label className='text-xs'>Total Project Cost</Label>
            <Input type='number' className='rounded-xl' value={roi.projectCost} onChange={e=>setROI({...roi, projectCost:Number(e.target.value||0)})}/>
          </div>
          <Button onClick={save} className='rounded-xl'><Save className='mr-2 w-4 h-4'/>Save</Button>
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader className='pb-2'><CardTitle className='text-base'>Result</CardTitle></CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>Net Gain/Loss: <span className='font-semibold'>{currency(net)}</span></div>
          <div>ROI: <span className='font-semibold'>{pct.toFixed(1)}%</span></div>
          <p className='text-xs text-slate-500'>Note: This is a simple estimate. Actual ROI depends on comps, finishes, and market conditions.</p>
        </CardContent>
      </Card>
    </div>
  )
}