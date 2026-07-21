//src/app/schedule/[storeId]/translations.ts

export const translations = {
  en: {
    scheduleTitle: "Schedule a Visit",
    bookVisitAt: (store: string) => `Book Your Visit at ${store}`,
    date: "Date *",
    time: "Time *",
    selectTime: "Select time",
    numberOfPeople: "Number of People *",
    person: "person",
    people: "people",
    notesLabel: "Additional Notes (Optional)",
    notesPlaceholder: "Any specific items you're looking for? Special requests?",
    bookButton: "Book Visit",
    bookingButton: "Booking...",
  },
  da: {
    scheduleTitle: "Book et besøg",
    bookVisitAt: (store: string) => `Book dit besøg hos ${store}`,
    date: "Dato *",
    time: "Tidspunkt *",
    selectTime: "Vælg tidspunkt",
    numberOfPeople: "Antal personer *",
    person: "person",
    people: "personer",
    notesLabel: "Yderligere noter (valgfrit)",
    notesPlaceholder: "Leder du efter noget specifikt? Særlige ønsker?",
    bookButton: "Book besøg",
    bookingButton: "Booker...",
  },
};
export type Lang = keyof typeof translations;