/* Pi-hole: A black hole for Internet advertisements
 * (c) 2019 Pi-hole, LLC (https://pi-hole.net)
 * Network-wide ad blocking via your own hardware.
 *
 * Web Interface
 * Live Log component
 *
 * This file is copyright under the latest version of the EUPL.
 * Please see LICENSE file for your rights under this license. */

import React, { Component } from "react";
import { animateScroll } from "react-scroll";
import { WithAPIData } from "../common/WithAPIData";
import { getTimeFromTimestamp } from "../../util/dateUtils";
import api from "../../util/api";
import { Input, Container, Row, Col } from "reactstrap";
import { WithTranslation, withTranslation } from "react-i18next";

export interface LiveLogProps {
  log: Array<{
    timestamp: number;
    message: string;
  }>;
}

interface LiveLogState {
  log: Array<{
    timestamp: number;
    message: string;
  }>;
}

let nextId = 0;
class LiveLog extends Component<LiveLogProps & WithTranslation, LiveLogState> {
  static getDerivedStateFromProps(
    state: LiveLogState,
    props: LiveLogProps
  ): LiveLogState {
    return {
      log: [...props.log, ...state.log]
    };
  }

  state: LiveLogState = { log: [] };
  scrollEnabled: boolean = true;

  componentDidUpdate() {
    if (this.scrollEnabled) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    animateScroll.scrollToBottom({
      containerId: "output",
      duration: 250,
      delay: 0,
      isDynamic: true
    });
  }

  checkBoxChange() {
    this.scrollEnabled = !this.scrollEnabled;
    this.scrollToBottom();
  }

  render() {
    const outputStyle = {
      width: "100%",
      height: "648px"
    };

    const { t } = this.props;

    return (
      <Container>
        <Row>
          <Col>
            <Input
              type="checkbox"
              checked={this.scrollEnabled}
              onChange={() => this.checkBoxChange()}
            />
            {t("Automatic scrolling on update")}
          </Col>
        </Row>
        <Row>
          <Col>
            <pre id="output" style={outputStyle}>
              {this.state.log.map((item, index) => (
                <div key={index}>
                  {getTimeFromTimestamp(item.timestamp) + " : " + item.message}
                </div>
              ))}
            </pre>
          </Col>
        </Row>
        <Row>
          <Col>
            <Input
              type="checkbox"
              checked={this.scrollEnabled}
              onChange={() => this.checkBoxChange()}
            />
            {t("Automatic scrolling on update")}
          </Col>
        </Row>
      </Container>
    );
  }
}

export const TranslatedLiveLog = withTranslation(["live-log"])(LiveLog);

export default (props: any) => (
  <WithAPIData
    apiCall={() => {
      return api.getLiveLog(nextId).then(response => {
        nextId = response.nextID;
        return response;
      });
    }}
    repeatOptions={{ interval: 500, ignoreCancel: true }}
    renderInitial={() => null}
    renderOk={data => <TranslatedLiveLog log={data.log} {...props} />}
    renderErr={() => null}
  />
);
