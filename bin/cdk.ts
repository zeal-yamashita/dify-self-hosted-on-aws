#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DifyOnAwsStack } from '../lib/dify-on-aws-stack';
import { UsEast1Stack } from '../lib/us-east-1-stack';
import { EnvironmentProps } from '../lib/environment-props';

export const props: EnvironmentProps = {
  awsRegion: 'us-east-1',
  awsAccount: process.env.CDK_DEFAULT_ACCOUNT!,
  // Set Dify version
  difyImageTag: '1.13.0',
  // Set plugin-daemon version to stable release
  difyPluginDaemonImageTag: '0.5.2-local',

  // uncomment the below options for less expensive configuration:
  // isRedisMultiAz: false,
  // useNatInstance: true,
  // enableAuroraScalesToZero: true,
  // useFargateSpot: true,

  // Please see EnvironmentProps in lib/environment-props.ts for all the available properties

  // ■ Docker HubではなくECRを利用する (../scripts/copy-to-ecr.tsを使います)
  //customEcrRepositoryName: 'dify-images',
  // ■ ドメイン設定
  domainName: 'dify-test-poc.com',
  subDomain: 'ennet',

    // ■ ネットワーク・セキュリティ設定
  // CloudFrontを使わず、ALBで直接通信します（シンプル構成）
  useCloudFront: false,
    // ■ コスト最適化設定（検証・小規模運用向け）
  useNatInstance: true, // 高価なNAT Gatewayの代わりにEC2(t4g.nano)を使用
  enableAuroraScalesToZero: true, // DBへの接続がない時に停止して課金を抑制
  isRedisMultiAz: false, // Redisをシングル構成にしてコスト削減
  useFargateSpot: false, // 必要に応じてtrue（さらに安くしたい場合）

  // ■ その他
  setupEmail: true, // SESによるメール送信設定（DNS重複がない前提）
  additionalEnvironmentVariables: [
  {
    key: 'UPLOAD_FILE_SIZE_LIMIT',
    value: '100', // 文字列として指定
    targets: ['api', 'worker'], // api(Main)とworkerコンテナのみに適用
  },
  {
    key: 'SINGLE_CHUNK_ATTACHMENT_LIMIT',
    value: '20', // 画像添付数上限を20に設定
    targets: ['api', 'worker'], // APIサーバーとWorkerの両方に適用
  },
  {
    key: 'FILES_URL',
    value: 'http://localhost:5001', // 外に出ずに内部で通信する
    targets: ['api', 'worker'], // APIサーバーとWorkerの両方に適用
  },
  // --- コード実行・タイムアウト設定 (API/Worker) ---
  {
    key: 'CODE_EXECUTION_CONNECT_TIMEOUT',
    value: '9000',
    targets: ['api', 'worker'],
  },
  {
    key: 'CODE_EXECUTION_READ_TIMEOUT',
    value: '600',
    targets: ['api', 'worker'],
  },
  {
    key: 'CODE_EXECUTION_WRITE_TIMEOUT',
    value: '300',
    targets: ['api', 'worker'],
  },
  {
    key: 'CODE_MAX_OBJECT_ARRAY_LENGTH',
    value: '300',
    targets: ['api', 'worker'],
  },
  {
    key: 'CODE_MAX_STRING_ARRAY_LENGTH',
    value: '300',
    targets: ['api', 'worker'],
  },
  {
    key: 'CODE_MAX_STRING_LENGTH',
    value: '1000000',
    targets: ['api', 'worker'],
  },
  {
    key: 'CODE_MAX_DEPTH',
    value: '15',
    targets: ['api', 'worker'],
  },
  // --- データベース・並列処理・ワークフロー設定 (API/Worker) ---
  {
    key: 'SQLALCHEMY_POOL_SIZE',
    value: '30',
    targets: ['api', 'worker'],
  },
  {
    key: 'MAX_PARALLEL_LIMIT',
    value: '20',
    targets: ['api', 'worker'],
  },
  {
    key: 'WORKFLOW_MAX_EXECUTION_TIME',
    value: '2400',
    targets: ['api', 'worker'],
  },
  {
    key: 'MAX_VARIABLE_SIZE',
    value: '1048576',
    targets: ['api', 'worker'],
  },
  {
    key: 'ENABLE_WORKFLOW_SCHEDULE_POLLER_TASK',
    value: 'true',
    targets: ['api', 'worker'],
  },
  {
    key: 'WORKFLOW_SCHEDULE_POLLER_INTERVAL',
    value: '1',
    targets: ['api', 'worker'],
  },
  {
    key: 'UPLOAD_FILE_BATCH_LIMIT',
    value: '20',
    targets: ['api', 'worker'],
  },
  // --- Sandbox設定 (Sandboxのみ) ---
  {
    key: 'ALLOWED_SYSCALLS',
    value:
      '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456',
    targets: ['sandbox'],
  },
  {
    key: 'SANDBOX_WORKER_TIMEOUT',
    value: '9000',
    targets: ['sandbox'],
  },
  {
    key: 'WORKER_TIMEOUT',
    value: '9000',
    targets: ['sandbox'],
  },
],
};
const app = new cdk.App();

let virginia: UsEast1Stack | undefined = undefined;
if ((props.useCloudFront ?? true) && (props.domainName || props.allowedIPv4Cidrs || props.allowedIPv6Cidrs)) {
  // add a unique suffix to prevent collision with different Dify instances in the same account.
  virginia = new UsEast1Stack(app, `DifyOnAwsUsEast1Stack${props.subDomain ? `-${props.subDomain}` : ''}`, {
    env: { region: 'us-east-1', account: props.awsAccount },
    crossRegionReferences: true,
    domainName: props.domainName,
    allowedIpV4AddressRanges: props.allowedIPv4Cidrs,
    allowedIpV6AddressRanges: props.allowedIPv6Cidrs,
  });
}

new DifyOnAwsStack(app, 'DifyOnAwsStackZeal', {
  env: { region: props.awsRegion, account: props.awsAccount },
  crossRegionReferences: true,
  ...props,
  cloudFrontCertificate: virginia?.certificate,
  cloudFrontWebAclArn: virginia?.webAclArn,
});
