import encodedQuotes from "./quotes.json";

export class Quote {
  quote: string;
  author: string;
  context: string;
  tags: string[];
  date: Date;

  constructor(
    quote: string,
    author: string,
    context: string,
    tags: string[],
    date: string,
  ) {
    // Quote, author, context are base-64 encoded. No sneak peeking in GitHub!
    this.quote = decodeURIComponent(escape(atob(quote)));
    this.author = decodeURIComponent(escape(atob(author)));
    this.context = decodeURIComponent(escape(atob(context)));

    this.tags = tags;
    this.date = new Date(date);
  }
}

export default class QuoteParser {
  static quoteCount(): number {
    return encodedQuotes.length;
  }

  static getQuote(index: number): Quote {
    const rawQuote = encodedQuotes[index];
    return new Quote(
      rawQuote.quote,
      rawQuote.author,
      rawQuote.context,
      rawQuote.tags,
      rawQuote.date,
    );
  }
}
