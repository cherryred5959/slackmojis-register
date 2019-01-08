const fetch = require('node-fetch');
const fs = require('fs');
const browser = require('./browser');
const slack = require('../slack');

const getImages = async (page) => {
  return page.evaluate(() => {
    const images = [];
    const emojiDomTrees = document.querySelectorAll('ul.emojis > .emoji');

    emojiDomTrees.forEach((emojiDomTree) => {
      const imgTag = emojiDomTree.querySelector('img');

      const nameTag = emojiDomTree.querySelector('.name');
      const nameTagInnerText = nameTag.innerText;

      const emojiGroup = emojiDomTree.parentNode.parentNode.querySelector('.title').innerText.toLowerCase();
      const emojiName = nameTagInnerText.split(':').pop();

      images.push({
        url: imgTag.getAttribute('src'),
        name: `${emojiGroup}_${emojiName}`.replace(/ /g, '_').replace(/-/g, '_'),
      });
    });

    return images;
  });
};

const emojiUpload = async (page, {
  image,
  prefix,
  path,
  workspaceUrl,
}) => {
  const imageResponse = await fetch(image.url);
  const [
    fileName,
  ] = imageResponse.url.split('/').slice(-1).pop().split('?');

  if (!imageResponse.ok) {
    return null;
  }

  const fileFullPath = `${path}/${fileName}`;
  await fs.writeFileSync(fileFullPath, Buffer.from(await imageResponse.arrayBuffer()));

  await page.click('button.p-customize_emoji_wrapper__custom_button');
  await page.waitForSelector('input#emojiimg, input#emojiname, button.c-dialog__go');

  const fileInput = await page.$('input#emojiimg');
  await fileInput.uploadFile(fileFullPath);

  await page.type('input#emojiname', `${prefix}_${image.name}`);

  return Promise.all([
    page.waitForResponse((response) => {
      const [url] = response.url().split('?');
      return url === `${workspaceUrl}/api/emoji.add`;
    }),
    page.evaluate(() => {
      document.querySelector('button.c-dialog__go').removeAttribute('disabled');
      document.querySelector('button.c-dialog__go').click();
    }),
    page.waitFor(() => !document.querySelector('.ReactModalPortal')),
  ]);
};

const handle = async (page, {
  workspace,
  email,
  password,
  prefix,
  path,
}) => {
  await page.goto('https://slackmojis.com', {
    waitUntil: 'domcontentloaded',
  });

  const images = await getImages(page);
  const workspaceUrl = slack(workspace);

  await page.goto(`${workspaceUrl}/customize/emoji`);
  await page.waitForSelector('input#email, input#password, button#signin_btn');
  await page.evaluate((myEmail, myPassword) => {
    document.querySelector('input#email').value = myEmail;
    document.querySelector('input#password').value = myPassword;
    document.querySelector('button#signin_btn').click();
  }, email, password);

  await page.waitForNavigation();
  await page.waitForSelector('button.p-customize_emoji_wrapper__custom_button');

  await Promise.all(images.map(async (image) => {
    return emojiUpload(page, {
      image,
      prefix,
      path,
      workspaceUrl,
    });
  }));
};

module.exports = async (information) => {
  return browser(handle, information);
};
