import { Star, Coffee } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto px-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <a
          href="https://github.com/ayip001/tasks2cal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-foreground transition-colors"
        >
          <Star className="h-4 w-4" />
          <span>Star on GitHub</span>
        </a>
        <a
          href="https://buymeacoffee.com/angusflies"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-foreground transition-colors"
        >
          <Coffee className="h-4 w-4" />
          <span>Buy me a coffee</span>
        </a>
      </div>
    </footer>
  );
}
