'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

interface CandidateData {
  candidate: {
    id: number
    first_name: string
    last_name: string
    email: string
    position: string
    skill: string
    created_on: string
  }
  status: {
    label: string
  }
}

interface DataTableProps {
  data: CandidateData[]
}

export function CandidatesTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns: ColumnDef<CandidateData>[] = [
    {
      accessorKey: 'candidate.first_name',
      header: 'Name',
      cell: ({ row }) => {
        const firstName = row.original.candidate.first_name
        const lastName = row.original.candidate.last_name
        return <div className="font-medium">{`${firstName} ${lastName}`}</div>
      },
    },
    {
      accessorKey: 'candidate.email',
      header: 'Email',
    },
    {
      accessorKey: 'candidate.position',
      header: 'Position',
      cell: ({ row }) => (
        <div className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {row.original.candidate.position}
        </div>
      ),
    },
    {
      accessorKey: 'status.label',
      header: 'Status',
      cell: ({ row }) => (
        <div className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          {row.original.status.label}
        </div>
      ),
    },
    {
      accessorKey: 'candidate.skill',
      header: 'Skills',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.candidate.skill}>
          {row.original.candidate.skill}
        </div>
      ),
    },
    {
      accessorKey: 'candidate.created_on',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.candidate.created_on), 'PPP'),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No candidates found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
