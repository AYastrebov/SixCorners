//
//  RootViewController.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/8/11.
//  Copyright __MyCompanyName__ 2011. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <GameKit/GameKit.h>

@interface RootViewController : UIViewController 
<GKLeaderboardViewControllerDelegate,GKAchievementViewControllerDelegate> 

- (void)leaderboardViewControllerDidFinish:(GKLeaderboardViewController *)viewController;
- (void)achievementViewControllerDidFinish:(GKAchievementViewController *)viewController;

@end
