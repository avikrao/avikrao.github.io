import encodedQuotes from "./quotes.json";

export class Quote {
  quote: string;
  author: string;
  context: string;
  tags: string[];
  date: Date;
  slug: string;

  constructor(
    quote: string,
    author: string,
    context: string,
    tags: string[],
    date: string,
    slug: string,
  ) {
    // Quote, author, context are base-64 encoded. No sneak peeking in GitHub!
    this.quote = decodeURIComponent(escape(atob(quote)));
    this.author = decodeURIComponent(escape(atob(author)));
    this.context = decodeURIComponent(escape(atob(context)));
    this.tags = tags;
    this.date = new Date(date);
    this.slug = slug;
  }
}

export default class QuoteParser {
  static readonly quoteSlices = Object.fromEntries(
    encodedQuotes.map((quoteObj) => [quoteObj.slug, quoteObj]),
  );

  static quoteCount(): number {
    return encodedQuotes.length;
  }

  static getQuote(slice: string): Quote {
    const rawQuote = this.quoteSlices[slice];
    return new Quote(
      rawQuote.quote,
      rawQuote.author,
      rawQuote.context,
      rawQuote.tags,
      rawQuote.date,
      rawQuote.slug,
    );
  }

  static getRandomQuote(): Quote {
    const randomQuoteId = Math.floor(Math.random() * QuoteParser.quoteCount());
    const slice = Object.keys(this.quoteSlices)[randomQuoteId];
    return this.getQuote(slice);
  }
}
