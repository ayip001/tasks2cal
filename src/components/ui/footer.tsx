import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/ayip001/tasks2cal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img
              src="https://img.shields.io/github/stars/ayip001/tasks2cal?style=social"
              alt="GitHub Stars"
            />
          </a>
          <a
            href="https://buymeacoffee.com/angusflies"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black"
              alt="Buy Me A Coffee"
            />
          </a>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
