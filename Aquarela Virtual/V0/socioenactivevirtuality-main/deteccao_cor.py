import os, cv2, numpy as np

#Classes
class DeteccaoCor:
    def __init__(self):
        self.count = 0

    def detect_color(self, imageFrame):
        hsvFrame = cv2.cvtColor(imageFrame, cv2.COLOR_BGR2HSV)

        yellow_lower = np.array([20, 100, 100], np.uint8)
        yellow_upper = np.array([30, 255, 255], np.uint8)
        yellow_mask = cv2.inRange(hsvFrame, yellow_lower, yellow_upper)

        # Morphological Transform, Dilation
        # for each color and bitwise_and operator
        # between imageFrame and mask determines
        # to detect only that particular color
        kernal = np.ones((5, 5), "uint8")

        # For yellow color
        yellow_mask = cv2.dilate(yellow_mask, kernal)
        res_yellow = cv2.bitwise_and(imageFrame, imageFrame, mask = yellow_mask)

        # Creating contour to track yellow color
        _, contours, hierarchy = cv2.findContours(yellow_mask,
        cv2.RETR_TREE,
        cv2.CHAIN_APPROX_SIMPLE)
        for pic, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if(area > 700):
                self.count += 1
                return self.count
        return self.count

    def update_count(self, snapshot):
        snapthotnp = np.fromfile(snapshot, np.uint8)
        snapshot = cv2.imdecode(snapthotnp, cv2.IMREAD_COLOR)
        self.detect_color(snapshot)
        print(self.count)