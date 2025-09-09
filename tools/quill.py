#!/usr/bin/env python3
"""
Quote Manager with Base64 Obfuscation 
"""

import argparse
import base64
import hashlib
import json
import sys
from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from pathlib import Path
from typing import List, Dict, Any


# ---------- Tags ----------

class Tag(Enum):
    LYRIC = "LYRIC"
    BOOK = "BOOK"
    MOVIE = "MOVIE"
    INTERVIEW = "INTERVIEW"
    COMEDY = "COMEDY"
    FRIEND = "FRIEND"

    def __str__(self):
        return self.value

    @classmethod
    def from_string(cls, value: str) -> "Tag":
        """Create Tag from string, handling case-insensitive input"""
        try:
            return cls(value.upper())
        except ValueError:
            try:
                return cls[value.upper()]
            except KeyError:
                raise ValueError(f"'{value}' is not a valid Tag")


# ---------- Quote ----------

@dataclass
class Quote:
    quote: str
    author: str
    context: str = ""
    tags: List[Tag] = field(default_factory=list)
    date_added: str = ""
    slug: str = ""

    def __post_init__(self):
        if not self.date_added:
            self.date_added = date.today().isoformat()
        if not self.slug:
            self.slug = self._generate_hash(self.quote)

    # ----- private helpers -----
    @staticmethod
    def _encode_field(text: str) -> str:
        return base64.b64encode(text.encode("utf-8")).decode("ascii")

    @staticmethod
    def _decode_field(encoded_text: str) -> str:
        try:
            return base64.b64decode(encoded_text).decode("utf-8")
        except Exception:
            return encoded_text  # fallback if not actually base64

    @staticmethod
    def _generate_hash(quote_text: str) -> str:
        return hashlib.sha256(quote_text.encode("utf-8")).hexdigest()[:12]

    # ----- serialization -----
    def to_dict_encoded(self) -> Dict[str, Any]:
        return {
            "quote": self._encode_field(self.quote),
            "author": self._encode_field(self.author),
            "context": self._encode_field(self.context),
            "tags": [tag.value for tag in self.tags],
            "date": self.date_added,
            "slug": self.slug,
        }

    def to_dict_plain(self) -> Dict[str, Any]:
        return {
            "quote": self.quote,
            "author": self.author,
            "context": self.context,
            "tags": [tag.value for tag in self.tags],
            "date_added": self.date_added,
            "slug": self.slug,
        }

    @classmethod
    def from_dict_encoded(cls, data: Dict[str, Any]) -> "Quote":
        tags = []
        for tag_str in data.get("tags", []):
            try:
                tags.append(Tag.from_string(tag_str))
            except ValueError:
                print(f"Warning: Skipping invalid tag '{tag_str}'")

        quote_text = cls._decode_field(data.get("quote", ""))
        return cls(
            quote=quote_text,
            author=cls._decode_field(data.get("author", "")),
            context=cls._decode_field(data.get("context", "")),
            tags=tags,
            date_added=data.get("date_added", data.get("date", date.today().isoformat())),
            slug=data.get("slug", cls._generate_hash(quote_text)),
        )

    def __str__(self):
        tags_str = ", ".join(str(tag) for tag in self.tags) if self.tags else "no tags"
        context_str = f" ({self.context})" if self.context else ""
        return f"\"{self.quote}\" - {self.author}{context_str} [{tags_str}] (slug: {self.slug})"


# ---------- QuoteManager ----------

class QuoteManager:
    def __init__(self, filename: str):
        self.filename = Path(filename)
        self.quotes: List[Quote] = []
        self._load()

    def _load(self):
        if not self.filename.exists():
            print(f"Creating new quote file: {self.filename}")
            return
        try:
            with open(self.filename, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.quotes = [Quote.from_dict_encoded(item) for item in data]
            print(f"Loaded {len(self.quotes)} quotes from {self.filename}")
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error loading quotes: {e}")
            sys.exit(1)

    def _save(self):
        try:
            with open(self.filename, "w", encoding="utf-8") as f:
                json.dump([quote.to_dict_encoded() for quote in self.quotes], f, indent=2, ensure_ascii=False)
            print(f"Saved {len(self.quotes)} quotes to {self.filename} (base64 encoded)")
        except IOError as e:
            print(f"Error saving quotes: {e}")

    # ----- core actions -----
    def add_quote_interactive(self):
        print("\n=== Adding New Quote ===")
        print("Enter the quote (press Enter twice when done):")
        lines = []
        while True:
            line = input()
            if line == "" and lines:
                break
            lines.append(line)
        quote_text = "\n".join(lines).strip()
        if not quote_text:
            print("Quote cannot be empty. Cancelled.")
            return

        author = input("Enter the author: ").strip()
        if not author:
            print("Author cannot be empty. Cancelled.")
            return

        context = input("Enter context (optional): ").strip()

        print(f"Available tags: {', '.join(tag.value for tag in Tag)}")
        tag_input = input("Enter tags (comma-separated, optional): ").strip()
        tags = []
        if tag_input:
            for tag_str in tag_input.split(","):
                tag_str = tag_str.strip()
                try:
                    tags.append(Tag.from_string(tag_str))
                except ValueError:
                    print(f"Warning: '{tag_str}' is not a valid tag, skipping")

        new_quote = Quote(quote=quote_text, author=author, context=context, tags=tags)
        self.quotes.append(new_quote)
        self._save()
        print(f"\nAdded: {new_quote}")

    def list_quotes(self):
        if not self.quotes:
            print("No quotes found.")
            return
        print(f"\n=== All Quotes ({len(self.quotes)}) ===")
        for i, quote in enumerate(self.quotes, 1):
            print(f"{i:2d}. {quote}")

    def search_quotes(self, query: str):
        query = query.lower()
        matches = [(i, q) for i, q in enumerate(self.quotes) if query in q.quote.lower()
                   or query in q.author.lower() or query in q.context.lower()]
        if not matches:
            print(f"No quotes found matching '{query}'")
            return
        print(f"\n=== Search Results for '{query}' ({len(matches)}) ===")
        for i, q in matches:
            print(f"{i+1:2d}. {q}")

    def delete_quote(self, identifier: str):
        q = self._find_by_identifier(identifier)
        if q:
            self.quotes.remove(q)
            self._save()
            print(f"Deleted: {q}")
        else:
            print("Quote not found.")

    def edit_quote(self, identifier: str):
        q = self._find_by_identifier(identifier)
        if not q:
            print("Quote not found.")
            return
        print(f"\nEditing: {q}\n")
        new_quote = input("New quote (leave blank to keep): ").strip()
        if new_quote:
            q.quote = new_quote
            q.slug = Quote._generate_hash(new_quote)
        new_author = input("New author (leave blank to keep): ").strip()
        if new_author:
            q.author = new_author
        new_context = input("New context (leave blank to keep): ").strip()
        if new_context:
            q.context = new_context
        new_tags = input("New tags comma-separated (leave blank to keep): ").strip()
        if new_tags:
            q.tags = [Tag.from_string(t.strip()) for t in new_tags.split(",") if t.strip()]
        self._save()
        print(f"Updated: {q}")

    def export_quotes(self, format_type: str = "json", encoded: bool = False):
        if format_type == "txt":
            output_file = self.filename.with_suffix(".txt")
            with open(output_file, "w", encoding="utf-8") as f:
                for q in self.quotes:
                    f.write(str(q) + "\n\n")
            print(f"Exported to {output_file}")
        else:
            suffix = ".encoded.json" if encoded else ".plain.json"
            output_file = self.filename.with_suffix(suffix)
            with open(output_file, "w", encoding="utf-8") as f:
                if encoded:
                    json.dump([q.to_dict_encoded() for q in self.quotes], f, indent=2, ensure_ascii=False)
                else:
                    json.dump([q.to_dict_plain() for q in self.quotes], f, indent=2, ensure_ascii=False)
            print(f"Exported to {output_file}")

    def view_raw_file(self):
        if not self.filename.exists():
            print("No file exists yet.")
            return
        print(f"\n=== Raw File Content ({self.filename}) ===")
        with open(self.filename, "r", encoding="utf-8") as f:
            content = f.read()
            for line in content.splitlines()[:10]:
                print(line)
            if len(content.splitlines()) > 10:
                print("...")

    # ----- utilities -----
    def _find_by_identifier(self, identifier: str) -> Quote | None:
        if identifier.isdigit():
            idx = int(identifier) - 1
            if 0 <= idx < len(self.quotes):
                return self.quotes[idx]
        else:
            for q in self.quotes:
                if q.slug == identifier:
                    return q
        return None


# ---------- CLI ----------

def main():
    parser = argparse.ArgumentParser(description="Quote Manager with Base64 Obfuscation")
    parser.add_argument("--file", "-f", type=str, default="quotes.json", help="Quote file path (default: quotes.json)")
    args = parser.parse_args()
    manager = QuoteManager(args.file)

    print("=== Quote Manager ===")
    print("Commands: (a)dd, (l)ist, (s)earch, (d)elete, (e)dit, (x)export, (r)aw, (q)uit")

    while True:
        try:
            cmd = input("\nquote> ").strip().lower()
            if cmd in ("q", "quit"):
                break
            elif cmd in ("a", "add"):
                manager.add_quote_interactive()
            elif cmd in ("l", "list"):
                manager.list_quotes()
            elif cmd in ("s", "search"):
                query = input("Search for: ").strip()
                if query:
                    manager.search_quotes(query)
            elif cmd in ("d", "delete"):
                ident = input("Enter index or slug to delete: ").strip()
                manager.delete_quote(ident)
            elif cmd in ("e", "edit"):
                ident = input("Enter index or slug to edit: ").strip()
                manager.edit_quote(ident)
            elif cmd in ("x", "export"):
                fmt = input("Format (json/txt): ").strip().lower()
                encoded = input("Export encoded? (y/n): ").strip().lower() == "y"
                manager.export_quotes(fmt, encoded)
            elif cmd in ("r", "raw"):
                manager.view_raw_file()
            else:
                print("Unknown command.")
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except EOFError:
            break


if __name__ == "__main__":
    main()

