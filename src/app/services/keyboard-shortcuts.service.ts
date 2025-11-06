import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private shortcuts: KeyboardShortcut[] = [];
  private shortcutTriggered = new Subject<KeyboardShortcut>();
  public shortcutTriggered$ = this.shortcutTriggered.asObservable();
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {
    // Only initialize in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.initializeGlobalShortcuts();
      this.setupEventListener();
    }
  }

  private initializeGlobalShortcuts(): void {
    // Ctrl+K: Focus search
    this.registerShortcut({
      key: 'k',
      ctrl: true,
      description: 'Focus search',
      action: () => {
        this.router.navigate(['/search']);
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }
    });

    // Ctrl+H: Go to home
    this.registerShortcut({
      key: 'h',
      ctrl: true,
      description: 'Go to home',
      action: () => {
        this.router.navigate(['/']);
      }
    });

    // Ctrl+D: Go to dashboard
    this.registerShortcut({
      key: 'd',
      ctrl: true,
      description: 'Go to dashboard',
      action: () => {
        this.router.navigate(['/dashboard']);
      }
    });

    // Ctrl+N: Create new inventory
    this.registerShortcut({
      key: 'n',
      ctrl: true,
      description: 'Create new inventory',
      action: () => {
        this.router.navigate(['/inventories/create']);
      }
    });

    // Escape: Close modal/go back
    this.registerShortcut({
      key: 'Escape',
      description: 'Close modal or go back',
      action: () => {
        // Check if there's an open modal
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
          // Click the close button or backdrop
          const closeButton = document.querySelector('.modal .btn-close') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    });

    // ? (Shift+/): Show keyboard shortcuts help
    this.registerShortcut({
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts help',
      action: () => {
        this.showShortcutsHelp();
      }
    });
  }

  private setupEventListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Exception: Allow Ctrl+K even in input fields
        if (!(event.ctrlKey && event.key.toLowerCase() === 'k')) {
          return;
        }
      }

      // Find matching shortcut
      const matchingShortcut = this.shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        return keyMatch && ctrlMatch && altMatch && shiftMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
        this.shortcutTriggered.next(matchingShortcut);
      }
    });
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  unregisterShortcut(key: string, ctrl = false, alt = false, shift = false): void {
    this.shortcuts = this.shortcuts.filter(s => 
      !(s.key === key && s.ctrl === ctrl && s.alt === alt && s.shift === shift)
    );
  }

  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  private showShortcutsHelp(): void {
    // Create and show a modal with keyboard shortcuts
    const helpHtml = `
      <div class="modal fade" id="keyboardShortcutsModal" tabindex="-1" aria-labelledby="keyboardShortcutsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="keyboardShortcutsModalLabel">
                <i class="fas fa-keyboard me-2"></i>Keyboard Shortcuts
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="list-group list-group-flush">
                ${this.shortcuts.map(s => `
                  <div class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${s.description}</span>
                    <span class="kbd">${this.formatShortcut(s)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('keyboardShortcutsModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', helpHtml);

    // Show modal using Bootstrap
    const modalElement = document.getElementById('keyboardShortcutsModal');
    if (modalElement) {
      // Show modal using Bootstrap's data attribute API
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.removeAttribute('aria-hidden');
      
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      document.body.classList.add('modal-open');

      // Clean up function
      const cleanup = () => {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        backdrop.remove();
        document.body.classList.remove('modal-open');
        modalElement.remove();
      };

      // Close on button click
      const closeBtn = modalElement.querySelector('[data-bs-dismiss="modal"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', cleanup);
      }

      // Close on backdrop click
      backdrop.addEventListener('click', cleanup);

      // Close on Escape key
      const escapeHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          cleanup();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    }
  }

  private formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }
}
