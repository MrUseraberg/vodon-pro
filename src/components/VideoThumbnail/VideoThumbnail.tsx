import React, { useEffect, useRef } from "react";
import { css } from "@emotion/react";

import useStore from "../../services/store";

import { Box, Heading, Flex, Button, Text } from "@chakra-ui/react";
import { Refresh as RefreshIcon, Settings as SettingsIcon } from "tabler-icons-react";

import type { Video } from "../../services/store";

interface Props {
  video: Video;
}

export default function Video({ video }: Props) {
  const videoRef = useRef(null);

  const setActiveVideoId = useStore((state) => state.setActiveVideoId);

  const activeVideoId = useStore((state) => state.activeVideoId);
  const currentTime = useStore((state) => state.currentTime);
  const playing = useStore((state) => state.playing);

  const isBeforeRange = currentTime < video.offsetNormalised;
  const isAfterRange = currentTime > video.durationNormalised;
  const currentActive = activeVideoId === video.id;

  function handleClickName(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
  }

  function handleClickVideo(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
    setActiveVideoId(video.id);
  }

  function handleClickReset(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
    setActiveVideoId(null);
  }

  // when this video becomes inactive, replace it in the list
  useEffect(() => {
    if (videoRef.current === null) {
      return;
    }

    if (currentActive === false) {
      videoRef.current.appendChild(video.el);
      video.el.volume = 0; // TODO: Remove from this, control in store
    }
  }, [currentActive]);

  // watch playing state and play / pause as needed
  useEffect(() => {
    if (playing === true) {
      video.el.play();
    } else {
      video.el.pause();
    }
  }, [playing]);

  // watch current time and update as needed
  useEffect(() => {
    if (playing === true) {
      return;
    }

    video.el.currentTime = currentTime + video.offsetNormalised;
  }, [playing, currentTime]);

  const videoStyles = css`
    display: ${currentActive === true || isBeforeRange === true || isAfterRange === true ? "none" : "block"};
  `;

  const beforeRangeStyles = css`
    aspect-ratio: 16 / 9;
    display: ${currentActive === false && isBeforeRange === true ? "block" : "none"};
  `;

  const afterRangeStyles = css`
    aspect-ratio: 16 / 9;
    display: ${currentActive === false && isAfterRange === true ? "block" : "none"};
  `;

  const resetStyles = css`
    aspect-ratio: 16 / 9;
    display: ${currentActive === true ? "flex" : "none"};
  `;

  return (
    <Box position={"relative"} cursor={"pointer"}>
      <Flex
        onClick={handleClickName}
        align={"center"}
        position={"absolute"}
        top={"0"}
        left={"0"}
        p={"2"}
        zIndex={1}
        bgColor={"blackAlpha.600"}
      >
        <SettingsIcon />
        <Heading fontSize={"medium"} ml={"2"} fontWeight={"normal"} textDecoration={"underline"}>
          {video.name}
        </Heading>
      </Flex>
      <Box zIndex={"0"}>
        <Box css={videoStyles} onClick={handleClickVideo} ref={videoRef} />
        <Flex css={beforeRangeStyles} align={"center"} justify={"center"} bgColor={"gray.700"}>
          <Text>BEFORE RANGE</Text>
        </Flex>
        <Flex css={afterRangeStyles} align={"center"} justify={"center"} bgColor={"gray.700"}>
          <Text>AFTER RANGE</Text>
        </Flex>
        <Flex css={resetStyles} onClick={handleClickVideo} align={"center"} justify={"center"} bgColor={"gray.700"}>
          <Button onClick={handleClickReset} leftIcon={<RefreshIcon />}>
            Reset
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}