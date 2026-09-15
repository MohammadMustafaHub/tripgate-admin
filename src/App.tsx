import { useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './components/ui/pagination'

const TOTAL_PAGES = 10

function App() {
  const [page, setPage] = useState(1)

  const go = (to: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    setPage(Math.min(Math.max(to, 1), TOTAL_PAGES))
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <p className="text-sm text-muted-foreground">
        الصفحة {page} من {TOTAL_PAGES}
      </p>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" text="السابق" onClick={go(page - 1)} />
          </PaginationItem>

          {[1, 2, 3].map((n) => (
            <PaginationItem key={n}>
              <PaginationLink href="#" isActive={page === n} onClick={go(n)}>
                {n}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink
              href="#"
              isActive={page === TOTAL_PAGES}
              onClick={go(TOTAL_PAGES)}
            >
              {TOTAL_PAGES}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext href="#" text="التالي" onClick={go(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default App
