import { ContentType } from "../../../index";

interface IMessage {
  id?: number;
  author: string;
  room: string;
  read?: boolean;
  createdAt?: Date;
  contentType: ContentType;
  offer: number | null;
  content: string;
}

const Messages: IMessage[] = [
  {
    id: 1,
    author: "1965b49b-3e55-4493-bc69-5701cabf8baa",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.text,
    content: "Hello, I am interested in your offer. Can you tell me more about it?",
    createdAt: new Date("2021-01-01T10:00:00.000Z"),
  },
  {
    id: 2,
    author: "14f9a310-958c-4273-b4b3-4377804642a5",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.text,
    content: "Sure, what would you like to know?",
    createdAt: new Date("2021-01-01T12:00:00.000Z"),
  },
  {
    id: 3,
    author: "1965b49b-3e55-4493-bc69-5701cabf8baa",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.text,
    content: "Can I get more photos and the original receipt?",
    createdAt: new Date("2021-01-01T13:00:00.000Z"),
  },
  {
    id: 4,
    author: "14f9a310-958c-4273-b4b3-4377804642a5",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.text,
    content: "Yes, I can send you more photos and the original receipt.",
    createdAt: new Date("2021-01-01T15:00:00.000Z"),
  },
  {
    id: 5,
    author: "14f9a310-958c-4273-b4b3-4377804642a5",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.file,
    content: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    createdAt: new Date("2021-01-01T15:35:00.000Z"),
  },
  {
    id: 6,
    author: "14f9a310-958c-4273-b4b3-4377804642a5",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.image,
    content: "https://www.w3schools.com/w3css/img_lights.jpg",
    createdAt: new Date("2021-01-01T15:57:00.000Z"),
  },
  {
    id: 7,
    author: "14f9a310-958c-4273-b4b3-4377804642a5",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.image,
    content: "https://www.w3schools.com/w3css/img_lights.jpg",
    createdAt: new Date("2021-01-01T16:12:00.000Z"),
  },
  {
    id: 8,
    author: "1965b49b-3e55-4493-bc69-5701cabf8baa",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.text,
    content: "Great, I will take it!",
    createdAt: new Date("2021-01-01T16:14:00.000Z"),
  },
  {
    id: 9,
    author: "1965b49b-3e55-4493-bc69-5701cabf8baa",
    room: "20fc42eb-53ce-4935-a187-16a1292b3270",
    read: true,
    offer: null,
    contentType: ContentType.offer,
    content: "OFFER",
    createdAt: new Date("2021-01-01T17:00:00.000Z"),
  },
];

export type { IMessage };
export { Messages };
