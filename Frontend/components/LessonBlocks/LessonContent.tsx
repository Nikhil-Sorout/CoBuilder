import type { LessonBlock, LessonContentPayload } from "@/types/lesson";
import BlockCode from "./BlockCode";
import BlockHeading from "./BlockHeading";
import BlockParagraph from "./BlockParagraph";
import BlockQuiz from "./BlockQuiz";
import { View } from "react-native";

export default function LessonContent({ content }: { content: LessonContentPayload }) {
  return (
    <View>
      {content.blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </View>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "heading":
      return <BlockHeading block={block} />;
    case "paragraph":
      return <BlockParagraph block={block} />;
    case "code":
      return <BlockCode block={block} />;
    case "quiz":
      return <BlockQuiz block={block} />;
    default:
      return null;
  }
}
