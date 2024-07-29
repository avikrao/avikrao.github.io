import argparse
import base64
import cmd
import enum
import json
from dataclasses import dataclass
from datetime import date
from functools import wraps
from typing import Callable


class Tag(enum.Enum):
    LYRIC = 1
    BOOK = 2
    MOVIE = 3


@dataclass
class Quote:
    """Base64-encoded quote"""

    quote: str
    author: str
    context: str
    tags: list[Tag]
    date: date

    @classmethod
    def new(cls) -> "Quote":
        return Quote("", "", "", [], date.today())

    @classmethod
    def load(cls, raw_quote: dict) -> "Quote":
        """Load a Quote object from an encoded dictionary"""
        encoded_quote: Quote = Quote(
            quote=raw_quote["quote"],
            author=raw_quote["author"],
            context=raw_quote["context"],
            tags=[Tag[tag] for tag in raw_quote["tags"]],
            date=date.fromisoformat(raw_quote["date"]),
        )

        return encoded_quote.decode()

    def encode(self) -> "Quote":
        """Base64-encoded quote for trivially encrypted storage"""

        def _encode(s: str) -> str:
            return base64.b64encode(s.encode()).decode()

        return Quote(
            _encode(self.quote),
            _encode(self.author),
            _encode(self.context),
            self.tags,
            self.date,
        )

    def decode(self) -> "Quote":
        """Raw quote decoded from base64"""

        def _decode(s: str) -> str:
            return base64.b64decode(s).decode()

        return Quote(
            _decode(self.quote),
            _decode(self.author),
            _decode(self.context),
            self.tags,
            self.date,
        )

    def export(self) -> dict:
        return {
            "quote": self.quote,
            "author": self.author,
            "context": self.context,
            "tags": [tag.name for tag in self.tags],
            "date": self.date.isoformat(),
        }


class Quill(cmd.Cmd):

    intro: str = "Welcome to Quill. Type help or ? to list commands.\n"
    prompt: str = "quill> "

    def __init__(self, quote_file: str) -> None:
        super(Quill, self).__init__()
        self.quote_file: str = quote_file
        with open(quote_file, "r") as qf:
            """
            Sample data:
            {
                'quote': 'This bridge brought to you by $president Awesome Funding Act!',
                'author': 'J. Pang',
                'context': 'On advertising benefits of a potentially unpopular project to customers',
                'tags': ['LYRIC']
                'date': 'Sat Jul 27 11:36 PM'
            }
            """
            raw_quotes: list[dict] = json.load(qf)

        self.quotes: list[Quote] = [Quote.load(quote) for quote in raw_quotes]
        self.new_quotes: list[Quote] = []

    def _display(self) -> None:
        print("Current quote: ")
        print(self.new_quotes[-1])

    def _validate(self) -> bool:
        if not self.new_quotes:
            print(
                "Error: Must begin a new quote with add_quote or select one with select_quote"
            )
        return bool(self.new_quotes)

    def _validate_quote(self, quote: Quote) -> bool:
        if not quote.quote:
            print("Error: Finish setting the body of the current quote with set_quote!")
        if not quote.author:
            print(
                "Error: Finish setting the author of the current quote with set_author!"
            )
        return bool(quote.quote) and bool(quote.author)

    @staticmethod
    def validate(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(self, *args, **kwargs) -> None:
            if not self._validate():
                return
            return func(self, *args, **kwargs)

        return wrapper

    def do_list_new(self, _: str):
        """List all newly added quotes"""
        for quote in self.new_quotes:
            print(quote)

    def do_list_all(self, _: str):
        """List all quotes"""
        for idx, quote in enumerate(self.quotes + self.new_quotes):
            print(f"{idx}: {quote}")

    def do_add_quote(self, _: str):
        """Add a new quote"""
        self.new_quotes.append(Quote.new())
        print(f"Started new quote: {self.new_quotes[-1]}")

    def do_save(self, _: str) -> bool:
        """Save quotes and exit"""
        raw_quotes: list[Quote] = self.quotes + self.new_quotes
        exported_quotes: list[dict] = []
        for quote in raw_quotes:
            if not self._validate_quote(quote):
                print("Error: Unable to save and exit due; some quotes are incomplete")
                return False
            encoded: Quote = quote.encode()
            exported_quotes.append(encoded.export())
        with open(self.quote_file, "w") as qf:
            json.dump(exported_quotes, qf, indent=2)
        return True

    def do_exit(self, _: str) -> bool:
        """Exit without saving"""
        return True

    @validate
    def do_set_quote(self, quote: str):
        """Set quote body"""
        self.new_quotes[-1].quote = quote.replace("\\n", "\n")
        self._display()

    @validate
    def do_set_author(self, author: str):
        """Set quote author"""
        self.new_quotes[-1].author = author
        self._display()

    @validate
    def do_set_context(self, context: str):
        """Set quote context (optional)"""
        self.new_quotes[-1].context = context
        self._display()

    @validate
    def do_add_tag(self, tag: str):
        """Add a quote tag (optional)"""
        if tag not in Tag.__members__:
            print(f"Error: {tag} is not a supported tag ({Tag.__members__})")
            return
        typed_tag: Tag = Tag[tag]
        tag_list: list[Tag] = self.new_quotes[-1].tags
        if typed_tag in tag_list:
            print(f"Error: {tag} already exists in tag set ({tag_list})")
            return
        tag_list.append(typed_tag)
        self._display()

    def do_select_quote(self, raw_quote_number: str):
        """Select a quote to update"""
        if not raw_quote_number.isdigit():
            print("Error: Enter a valid quote index.")
            return
        quote_number: int = int(raw_quote_number)

        def _pop_quote(quote_number: int):
            if quote_number < len(self.quotes):
                return self.quotes.pop(quote_number)
            quote_number -= len(self.quotes)
            if quote_number < len(self.new_quotes):
                return self.new_quotes.pop(quote_number)
            return None

        quote = _pop_quote(quote_number)
        if quote:
            self.new_quotes.append(quote)
            print(f"Selected {quote}")

    @validate
    def do_delete_selected(self, _: str):
        """Delete currently WIP quote"""
        deleted: Quote = self.new_quotes.pop()
        print(f"Successfully deleted {deleted}")


if __name__ == "__main__":
    parser: argparse.ArgumentParser = argparse.ArgumentParser()
    parser.add_argument("--quote-file", "-f", type=str, required=True)
    args: argparse.Namespace = parser.parse_args()
    Quill(args.quote_file).cmdloop()
