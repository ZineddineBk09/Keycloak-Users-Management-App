'use client'

import * as React from 'react'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTablePagination } from './pagination'
import { useUsersContext } from '@/context/users'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Skeleton } from '../ui/skeleton'
import { KeycloakUser } from '@/interfaces'
import { deleteUser, updateUser } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const { users, fetchUsers } = useUsersContext()
  const { session } = useAuth()
  const [data, setData] = React.useState<TData[]>([] as TData[])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      deleteRow: async (row: KeycloakUser) => {
        await deleteUser(row.id, session.access_token)
          .then(() => {
            toast.success('User deleted successfully')
            fetchUsers()
          })
          .catch((error) => {
            toast.error('Error deleting user')
            console.error(error)
          })
      },

      updateRow: async (row: KeycloakUser) => {
        await updateUser(row, row.id, session.access_token)
          .then(() => {
            toast.success('User updated successfully')
            fetchUsers()
          })
          .catch((error) => {
            toast.error('Error updating user')
            console.error(error)
          })
      },
    },
  })

  React.useEffect(() => {
    setData(users as TData[])
  }, [users])

  return (
    <div>
      {/* Filters */}
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter emails...'
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('email')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <div className='flex items-center gap-x-4 ml-auto'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-auto'>
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column, index) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={index}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant='outline'
            onClick={async () => {
              await fetchUsers()
                .then(() => {
                  toast.success('Users fetched successfully')
                  fetchUsers()
                })
                .catch((error) => {
                  toast.error('Error fetching users')
                  console.error(error)
                })
            }}
            className='h-8 w-8 p-0'
          >
            <span className='sr-only'>Reload</span>
            <ReloadIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Table Rows */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={index}>
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead key={idx}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table?.getRowModel().rows?.length ? (
              table?.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {Array.from({ length: 10 }, (_, index) => (
                    <Skeleton
                      className='h-12 w-full rounded-xl border my-1'
                      key={index}
                    />
                  )).map((skeleton) => skeleton)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
