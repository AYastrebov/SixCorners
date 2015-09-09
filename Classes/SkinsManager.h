//
//  SkinsManager.h
//  6Corners
//
//  Created by Andrey Yastrebov on 3/5/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface SkinsManager : NSObject 

+ (NSString *)skinBundlePath:(NSUInteger)skin;
+ (NSString *)currentBundlePath;
+ (NSString *)currentLocale;
+ (NSString *)figuresPath;
+ (NSString *)fontsPath;
+ (NSString *)gameFieldPath;
+ (NSString *)menuPath;
+ (NSString *)hexMapPath;
+ (NSString *)menuButtonsPath;
+ (NSUInteger)currentSkin;

@end
