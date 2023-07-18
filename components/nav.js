import Link from 'next/link'

const Nav = () => {
  return (
    <nav>
      <div className="title-bar" style={{ padding: '4px 12px' }}>
        <Link href="/">
          <div className="title-bar-text" style={{ cursor: 'pointer' }}>
            The Outernet Scrapbook
          </div>
        </Link>
        <div className="title-bar-controls">
          <Link href="/new">
            <button style={{ color: 'black', padding: '0 4px' }}>
              Contribute to the Scrapbook
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Nav
